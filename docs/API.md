# API Reference

## Table of Contents
- [Core Functions](#core-functions)
- [Context Engine](#context-engine)
- [File Manager](#file-manager)
- [Channel Adapters](#channel-adapters)
- [Notifications](#notifications)
- [Utilities](#utilities)

## Core Functions

### `sendFileWithContext(options)`
Main function for context-aware file transfer.

**Parameters:**
```javascript
{
  file: string,           // Path to the file
  caption?: string,       // Optional file description
  options?: {             // Transfer options
    notifyAll?: boolean,  // Notify all group members
    showProgress?: boolean, // Show transfer progress
    priority?: 'low' | 'medium' | 'high', // Transfer priority
    channel?: string,     // Specific channel to use
    metadata?: object     // Additional metadata
  }
}
```

**Returns:**
```javascript
{
  success: boolean,       // Transfer success status
  messageId: string,      // Message ID of the transfer
  context: {              // Detected context
    type: 'group' | 'private',
    target: string,
    participants?: number
  },
  stats: {                // Transfer statistics
    size: string,
    duration: number,
    speed: string
  }
}
```

### `listAvailableFiles(directory, filter)`
Lists files available for transfer.

**Parameters:**
```javascript
directory: string,        // Directory path
filter?: {                // Optional filter
  types?: string[],       // File types to include
  maxSize?: string,       // Maximum file size
  modifiedAfter?: string, // Modified after date
  search?: string         // Search term in filename
}
```

**Returns:**
```javascript
{
  files: Array<{
    name: string,
    path: string,
    size: string,
    type: string,
    modified: string,
    permissions: string
  }>,
  total: number,          // Total file count
  size: string,           // Total size of files
  directory: string       // Original directory
}
```

### `getTransferHistory(limit, filter)`
Retrieves file transfer history.

**Parameters:**
```javascript
limit?: number,           // Maximum records to return
filter?: {                // Optional filter
  channel?: string,       // Filter by channel
  status?: 'success' | 'failed' | 'pending',
  dateRange?: {           // Date range filter
    start: string,
    end: string
  },
  user?: string           // Filter by user
}
```

**Returns:**
```javascript
{
  history: Array<{
    id: string,
    timestamp: string,
    file: string,
    size: string,
    channel: string,
    status: string,
    context: object,
    duration?: number,
    error?: string
  }>,
  stats: {                // Statistics
    total: number,
    successful: number,
    failed: number,
    totalSize: string,
    averageDuration: number
  }
}
```

## Context Engine

### `ContextEngine`
Class for analyzing conversation context.

**Methods:**
```javascript
class ContextEngine {
  // Analyze message context
  analyze(message: string, metadata: object): ContextAnalysis
  
  // Detect scene type
  detectScene(metadata: object): 'group' | 'private'
  
  // Extract transfer intent
  extractIntent(message: string): TransferIntent
  
  // Calculate transfer priority
  calculatePriority(context: object): PriorityLevel
}
```

**Types:**
```javascript
type ContextAnalysis = {
  scene: 'group' | 'private',
  intent: TransferIntent,
  priority: PriorityLevel,
  constraints: TransferConstraints,
  recommendations: TransferRecommendations
};

type TransferIntent = {
  action: 'send' | 'share' | 'distribute',
  urgency: 'immediate' | 'soon' | 'whenever',
  audience: 'all' | 'specific' | 'private'
};
```

## File Manager

### `FileManager`
Class for file operations and validation.

**Methods:**
```javascript
class FileManager {
  // Validate file
  validate(filePath: string): ValidationResult
  
  // Get file information
  getInfo(filePath: string): FileInfo
  
  // Check file size
  checkSize(filePath: string, maxSize: string): SizeCheck
  
  // Check file type
  checkType(filePath: string, allowedTypes: string[]): TypeCheck
  
  // Prepare file for transfer
  prepare(filePath: string, options: object): PreparedFile
}
```

**Types:**
```javascript
type FileInfo = {
  name: string,
  path: string,
  size: number,
  humanSize: string,
  type: string,
  mimeType: string,
  extension: string,
  modified: Date,
  created: Date,
  permissions: string
};

type ValidationResult = {
  valid: boolean,
  errors: string[],
  warnings: string[],
  info: FileInfo
};
```

## Channel Adapters

### Base Channel Interface
```javascript
interface ChannelAdapter {
  // Send file through channel
  sendFile(file: PreparedFile, options: object): Promise<SendResult>
  
  // Check channel availability
  isAvailable(): boolean
  
  // Get channel capabilities
  getCapabilities(): ChannelCapabilities
  
  // Validate file for channel
  validateFile(file: FileInfo): ValidationResult
}
```

### Telegram Adapter
```javascript
class TelegramAdapter implements ChannelAdapter {
  constructor(config: TelegramConfig) {}
  
  sendFile(file: PreparedFile, options: object): Promise<SendResult> {
    // Telegram-specific implementation
  }
  
  getCapabilities(): ChannelCapabilities {
    return {
      maxSize: '2GB',
      supportedTypes: ['*'],
      features: ['progress', 'thumbnails', 'captions']
    };
  }
}
```

### WhatsApp Adapter
```javascript
class WhatsAppAdapter implements ChannelAdapter {
  constructor(config: WhatsAppConfig) {}
  
  sendFile(file: PreparedFile, options: object): Promise<SendResult> {
    // WhatsApp-specific implementation
  }
  
  getCapabilities(): ChannelCapabilities {
    return {
      maxSize: '100MB',
      supportedTypes: ['pdf', 'jpg', 'png', 'docx'],
      features: ['captions']
    };
  }
}
```

## Notifications

### `NotificationSystem`
Class for managing user notifications.

**Methods:**
```javascript
class NotificationSystem {
  // Send progress notification
  sendProgress(progress: ProgressInfo): Promise<void>
  
  // Send completion notification
  sendCompletion(result: SendResult): Promise<void>
  
  // Send error notification
  sendError(error: TransferError): Promise<void>
  
  // Update existing notification
  updateNotification(messageId: string, update: NotificationUpdate): Promise<void>
}
```

**Types:**
```javascript
type ProgressInfo = {
  file: string,
  progress: number,        // 0-100
  transferred: string,     // Human-readable size
  total: string,          // Human-readable total
  speed: string,          // Transfer speed
  estimatedTime: string   // Estimated time remaining
};

type NotificationUpdate = {
  text?: string,
  progress?: number,
  status?: 'progress' | 'complete' | 'error'
};
```

## Utilities

### `Logger`
Configurable logging utility.

```javascript
const logger = new Logger({
  level: 'info',          // 'error', 'warn', 'info', 'debug'
  format: 'json',         // 'json' or 'text'
  transports: ['console', 'file']
});

logger.info('File transfer started', { file: 'report.pdf' });
logger.error('Transfer failed', { error: error.message });
```

### `ConfigManager`
Configuration management.

```javascript
const config = new ConfigManager({
  defaults: {
    maxFileSize: '100MB',
    allowedTypes: ['pdf', 'docx', 'jpg', 'png']
  },
  envPrefix: 'FT_',
  configFile: 'config/file-transfer.json'
});

const maxSize = config.get('maxFileSize');
const channels = config.get('channels.telegram');
```

### `Validator`
Input validation utility.

```javascript
const validator = new Validator();

// Validate file transfer request
const schema = {
  file: validator.string().required().fileExists(),
  caption: validator.string().optional().maxLength(200),
  options: validator.object().optional().shape({
    notifyAll: validator.boolean().optional(),
    showProgress: validator.boolean().optional()
  })
};

const result = validator.validate(request, schema);
if (!result.valid) {
  throw new Error(result.errors.join(', '));
}
```

## Error Handling

### Custom Errors
```javascript
class FileTransferError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'FileTransferError';
  }
}

// Usage
throw new FileTransferError(
  'FILE_TOO_LARGE',
  'File exceeds maximum size',
  { fileSize: '150MB', maxSize: '100MB' }
);
```

### Error Codes
| Code | Description | HTTP Status |
|------|-------------|-------------|
| `FILE_NOT_FOUND` | File does not exist | 404 |
| `FILE_TOO_LARGE` | File exceeds size limit | 413 |
| `UNSUPPORTED_TYPE` | File type not supported | 415 |
| `CHANNEL_DISABLED` | Requested channel is disabled | 400 |
| `PERMISSION_DENIED` | Insufficient permissions | 403 |
| `TRANSFER_FAILED` | Transfer failed | 500 |
| `NETWORK_ERROR` | Network connectivity issue | 503 |

## Examples

### Basic Usage
```javascript
import { sendFileWithContext } from 'openclaw-file-transfer-skill';

const result = await sendFileWithContext({
  file: '/path/to/report.pdf',
  caption: 'Monthly sales report',
  options: {
    notifyAll: true,
    showProgress: true
  }
});

console.log(`Transfer successful: ${result.messageId}`);
```

### Advanced Usage
```javascript
import { FileManager, ContextEngine } from 'openclaw-file-transfer-skill';

const fileManager = new FileManager();
const contextEngine = new ContextEngine();

// Validate file
const validation = await fileManager.validate('/path/to/file.pdf');
if (!validation.valid) {
  throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
}

// Analyze context
const context = contextEngine.analyze(
  'Please share this document with the team',
  { isGroupChat: true, chatId: 'group-123' }
);

console.log(`Context: ${context.scene}, Priority: ${context.priority}`);
```

### Error Handling
```javascript
import { sendFileWithContext, FileTransferError } from 'openclaw-file-transfer-skill';

try {
  const result = await sendFileWithContext({
    file: '/path/to/large-file.zip',
    caption: 'Large dataset'
  });
} catch (error) {
  if (error instanceof FileTransferError) {
    console.error(`Transfer error (${error.code}): ${error.message}`);
    if (error.details) {
      console.error('Details:', error.details);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```