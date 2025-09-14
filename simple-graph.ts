import { AIMessage, BaseMessage } from '@langchain/core/messages';
import { MessagesZodMeta, START, StateGraph } from '@langchain/langgraph';
import { registry } from '@langchain/langgraph/zod';
import { z } from 'zod/v4';

const State = z.object({
  messages: z
    .array(z.custom<BaseMessage>())
    .register(registry, MessagesZodMeta),
  extraField: z.number(),
});

const node = (state: z.infer<typeof State>) => {
  const messages = state.messages;
  const newMessage = new AIMessage('Hello!');
  return { messages: messages.concat([newMessage]), extraField: 10 };
};

const graph = new StateGraph(State)
  .addNode('node', node)
  .addEdge(START, 'node')
  .compile();
