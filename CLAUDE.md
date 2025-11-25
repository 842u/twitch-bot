# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Twitch chat bot built with TypeScript that connects to Twitch IRC using WebSockets. The project follows Domain-Driven Design (DDD) principles with a clear separation between domain, application, and infrastructure layers.

## Development Commands

### Running the Application
```bash
npm start
```
Runs the bot using tsx to execute src/main.ts with hot reloading support.

### Linting and Formatting
```bash
npx @biomejs/biome check --write [files]
```
The project uses Biome for linting and formatting. Configuration is in biome.json:
- Tab indentation
- 100 character line width
- Double quotes for strings
- Auto-organize imports

### Type Checking
```bash
npx tsc --noEmit
```
Runs TypeScript type checking without emitting files.

### Git Hooks
Pre-commit and pre-push hooks run automatically via Husky:
- Pre-commit: runs lint-staged (Biome check + write) and type checking
- Pre-push: same as pre-commit
- Both hooks must pass before commit/push

## Architecture

### High-Level Structure

The codebase is organized into:
- `src/common/`: Shared abstractions and utilities used across modules
- `src/module/`: Feature modules (currently only `chat`)

### Domain-Driven Design Patterns

**Result Pattern**: All operations that can fail return a `Result<T, E>` type instead of throwing exceptions. Result provides type-safe success/failure handling:
```typescript
// From src/common/application/result/index.ts
Result.ok(data)    // Success case
Result.fail(error) // Failure case
```

**Value Objects**: Immutable objects defined by their values (from `src/common/domain/value-object/index.ts`):
- Extend `ValueObject<T>` base class
- Must implement static `create()` method returning `Result<ValueObject, Error>`
- Value is immutable and sealed
- Examples: CommandName, CommandDescription, Cooldown, Permission, Id

**Entities**: Objects with identity (from `src/common/domain/entity/index.ts`):
- Extend `Entity<T extends BaseEntityValue>` base class
- Must have an `id` property of type `Id`
- Must implement static `create()` method returning `Result<Entity, Error>`
- Value is immutable and sealed via `Object.seal()`

**Validation**: Uses Zod schemas with a custom validator abstraction:
- Each Value Object has a companion `schema.ts` file with Zod schema
- Validators implement the `Validator` interface from `src/common/application/validator/index.ts`
- ZodValidator (in `src/common/infrastructure/validator/zod.ts`) adapts Zod to the Validator interface
- Validation errors include structured issues with path and message

### Module Structure

Each module follows a layered architecture:

**Domain Layer** (`src/module/*/domain/`):
- Contains pure domain models (entities and value objects)
- No dependencies on infrastructure or external libraries (except validation schemas)
- Each value object has:
  - `index.ts`: Class definition extending ValueObject
  - `schema.ts`: Zod schema and validator instance

**Application Layer** (`src/module/*/application/`):
- Contains application services and use cases
- IRC message handling (parser and serializer) lives here
- Parser: Parses IRC protocol messages per IRC specs (https://modern.ircdocs.horse)
- Serializer: Converts data structures into IRC protocol format

**Infrastructure Layer** (`src/common/infrastructure/`):
- Concrete implementations of application interfaces
- Currently includes ZodValidator and DefaultWebSocketClient

### IRC Message Processing

The bot implements the IRC protocol (see src/module/chat/application/irc/):
- `IrcParser`: Parses messages from Twitch IRC (tags, source, command, parameters)
- `IrcSerializer`: Serializes messages to send to Twitch IRC
- Message format follows https://modern.ircdocs.horse/#message-format
- Tags format follows https://ircv3.net/specs/extensions/message-tags.html

## Configuration

### Environment Variables
The project uses dotenv. Required environment variables (from src/main.ts):
- `TWITCH_WEBSOCKET_URL`: WebSocket URL for Twitch IRC
- `TWITCH_USER`: Bot username
- `TWITCH_TOKEN`: OAuth token for authentication

### TypeScript Configuration
- Module system: `"preserve"` mode (modern ESM)
- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
- Target: esnext

## Code Style Guidelines

### Creating Domain Objects

When creating new Value Objects or Entities:

1. Create the schema file first:
```typescript
// value-object/foo/schema.ts
import { z } from "zod";
import { ZodValidator } from "@/common/infrastructure/validator/zod";

export const fooSchema = z.string().min(1).max(100);
export const fooValidator = new ZodValidator();
```

2. Create the class extending the base:
```typescript
// value-object/foo/index.ts
import { Result } from "@/common/application/result";
import { ValidatorError } from "@/common/application/validator";
import { ValueObject } from "@/common/domain/value-object";
import { fooSchema, fooValidator } from "./schema";

export class FooError extends ValidatorError {
  constructor(message: string, issues: ValidatorIssue[]) {
    super(message, issues);
    this.name = "FooError";
  }
}

export class Foo extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string) {
    const result = fooValidator.validate(value, fooSchema);

    if (!result.success) {
      const { message, issues } = result.error;
      return Result.fail(new FooError(message, issues));
    }

    return Result.ok(new Foo(value));
  }
}
```

3. For Entities, follow the same pattern but extend `Entity<T>` and ensure `T` includes an `id` field

### Working with Results

Always check the `success` property before accessing data:
```typescript
const result = Foo.create("value");

if (!result.success) {
  console.log(result.error);
  return;
}

// TypeScript now knows result.data exists
const foo = result.data;
```

### Import Paths

Always use the `@/*` path alias for imports from src:
```typescript
import { Result } from "@/common/application/result";
import { ValueObject } from "@/common/domain/value-object";
```
