#!/usr/bin/env -S uv run --script
# /// script
# dependencies = [
#   "librosa>=0.10.1",
#   "numpy>=1.26.0",
#   "scipy>=1.12.0",
# ]
# ///
"""
Find jingle occurrences using librosa with uv for dependency management.

Usage:
    uv run scripts/find_jingles_uv.py <jingle.wav> <episode-audio>
"""

import sys
import json
import numpy as np
import librosa
from scipy.signal import correlate, find_peaks

def find_jingles(jingle_path: str, episode_path: str, skip_intro_seconds: int = 60, skip_outro_seconds: int = 60):
    """Find all jingle occurrences using cross-correlation."""

    # Load audio files
    print("Loading jingle...", file=sys.stderr)
    jingle, sr_jingle = librosa.load(jingle_path, sr=16000, mono=True)
    print(f"✓ Jingle: {len(jingle)} samples ({len(jingle)/sr_jingle:.2f}s)", file=sys.stderr)

    print("Loading episode...", file=sys.stderr)
    episode, sr_episode = librosa.load(episode_path, sr=16000, mono=True)
    episode_duration = len(episode) / sr_episode
    print(f"✓ Episode: {len(episode)} samples ({episode_duration/60:.1f} minutes)", file=sys.stderr)

    # Trim intro/outro to avoid false positives from looping jingle
    skip_intro_samples = int(skip_intro_seconds * sr_episode)
    skip_outro_samples = int(skip_outro_seconds * sr_episode)
    episode_trimmed = episode[skip_intro_samples:-skip_outro_samples]

    print(f"  Skipping: first {skip_intro_seconds}s and last {skip_outro_seconds}s (jingle loops in background)", file=sys.stderr)

    # Normalize audio (important for comparison)
    jingle = jingle / np.max(np.abs(jingle))
    episode_trimmed = episode_trimmed / np.max(np.abs(episode_trimmed))

    # Use cross-correlation to find matches
    print("\nScanning with cross-correlation...", file=sys.stderr)
    correlation = correlate(episode_trimmed, jingle, mode='valid', method='fft')

    print(f"✓ Correlation computed: {len(correlation)} values", file=sys.stderr)
    print(f"  Max: {np.max(correlation):.2f}, Min: {np.min(correlation):.2f}", file=sys.stderr)
    print(f"  Mean: {np.mean(correlation):.2f}, Std: {np.std(correlation):.2f}", file=sys.stderr)

    # Find peaks in the correlation signal
    # Height parameter ensures we only get significant peaks
    # Using 1.5 std to catch more real segments (was 2 std, too strict)
    peak_indices, properties = find_peaks(
        correlation,
        height=np.mean(correlation) + 1.5 * np.std(correlation),
        distance=int(5 * sr_episode)  # At least 5 seconds apart
    )

    print(f"\n✓ Found {len(peak_indices)} peaks\n", file=sys.stderr)

    # Convert peaks to timestamps with confidence scores
    matches = []
    for idx in peak_indices:
        # Add back the skip_intro_seconds offset to get actual episode timestamp
        timestamp = float(idx / sr_episode) + skip_intro_seconds
        # Normalize correlation value to 0-100 confidence
        correlation_value = correlation[idx]
        max_possible = np.max(correlation)
        confidence = (correlation_value / max_possible) * 100 if max_possible > 0 else 0

        matches.append({
            "timestamp": timestamp,
            "confidence": float(confidence),
            "correlation_value": float(correlation_value)
        })

        mins = int(timestamp // 60)
        secs = int(timestamp % 60)
        print(f"  {mins}:{secs:02d} - {confidence:.1f}% confidence", file=sys.stderr)

    # Sort by confidence
    matches = sorted(matches, key=lambda x: x['confidence'], reverse=True)

    # Output JSON
    print(json.dumps(matches))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: uv run scripts/find_jingles_uv.py <jingle.wav> <episode-audio>", file=sys.stderr)
        sys.exit(1)

    jingle_path = sys.argv[1]
    episode_path = sys.argv[2]

    find_jingles(jingle_path, episode_path)
