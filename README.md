# Event-Sourcing POC

## Requirements

- NodeJS (0.12)
- AMQP compliant broker (tested with RabbitMQ)
- Event storage (tested with MongoDB)

## Installation

Include the node module in your project by installing it through npm:
```sh
npm install --save event-sourcing
```

## Usage

The pattern is split up into two distinct parts. Publishers and Consumers. Publishers are responsible for persisting an incoming event and emitting it to consumers for process. Consumers listen for specific events and contain the business logic.

### Publishers

Todo.

### Consumers

Todo.

## 1.0 Roadmap

- Usage examples
- Interface storage to plug multiple engines (File based, SQL, Document)
- Test with multiple AMQP brokers
- Snapshot creation
- Re-emit events support
- Event replay
- Event breakpointing