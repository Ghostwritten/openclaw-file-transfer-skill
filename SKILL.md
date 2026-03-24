# File Transfer Skill

## Overview
Context-aware file transfer skill for OpenClaw ecosystem. Intelligently transfers files based on conversation context with smart notifications.

## Features
- **Context-Aware**: Automatically detects group/private chat contexts
- **Smart Notifications**: Progressive feedback with completion/error handling
- **Multi-Channel**: Telegram, WhatsApp, Discord support
- **File Management**: Type validation, size limits, progress tracking

## Installation
```bash
openclaw skill install openclaw-file-transfer-skill
```

## Usage Examples

### Basic File Transfer
```javascript
// Smart file transfer based on context
const result = await fileTransfer.sendFile({
  file: "/path/to/document.pdf",
  caption: "Team weekly report",
  options: {
    notifyAll: true,
    showProgress: true
  }
});
```

### Advanced Configuration
```javascript
// Custom configuration
const config = {
  channels: {
    telegram: { enabled: true, maxSize: "2GB" },
    whatsapp: { enabled: false }
  },
  notifications: {
    level: "detailed",
    format: "markdown"
  }
};

await fileTransfer.configure(config);
```

## Tool Definitions

### sendFileWithContext
Transfers a file with intelligent context detection.

**Parameters:**
- `file` (string): Path to the file
- `caption` (string, optional): File description
- `options` (object, optional): Transfer options
  - `notifyAll` (boolean): Notify all group members
  - `showProgress` (boolean): Show transfer progress
  - `priority` (string): Transfer priority (low/medium/high)

**Returns:**
- `success` (boolean): Transfer success status
- `messageId` (string): Message ID of the transfer
- `context` (object): Detected context information

### listAvailableFiles
Lists files available for transfer in a directory.

**Parameters:**
- `directory` (string): Directory path
- `filter` (object, optional): Filter options
  - `types` (array): File types to include
  - `maxSize` (string): Maximum file size
  - `modifiedAfter` (string): Modified after date

**Returns:**
- `files` (array): List of file objects
- `total` (number): Total file count
- `size` (string): Total size of files

### getTransferHistory
Retrieves file transfer history.

**Parameters:**
- `limit` (number, optional): Maximum records to return
- `filter` (object, optional): Filter options
  - `channel` (string): Filter by channel
  - `status` (string): Filter by status
  - `dateRange` (object): Date range filter

**Returns:**
- `history` (array): Transfer history records
- `stats` (object): Transfer statistics

## Configuration

### Environment Variables
```env
# File transfer settings
MAX_FILE_SIZE=100MB
ALLOWED_TYPES=pdf,docx,jpg,png
NOTIFICATION_LEVEL=detailed

# Channel configurations
TELEGRAM_ENABLED=true
WHATSAPP_ENABLED=false
DISCORD_ENABLED=true
```

### Configuration File
Create `config/file-transfer.json`:
```json
{
  "defaults": {
    "maxFileSize": "100MB",
    "allowedTypes": ["pdf", "docx", "jpg", "png"],
    "notificationLevel": "detailed"
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "maxSize": "2GB",
      "supportedTypes": ["*"]
    },
    "whatsapp": {
      "enabled": false,
      "maxSize": "100MB",
      "supportedTypes": ["pdf", "jpg", "png"]
    }
  },
  "notifications": {
    "progress": true,
    "completion": true,
    "errors": true,
    "format": "markdown"
  }
}
```

## Error Handling

The skill provides comprehensive error handling:

### Common Errors
- `FILE_NOT_FOUND`: Specified file does not exist
- `FILE_TOO_LARGE`: File exceeds size limit
- `UNSUPPORTED_TYPE`: File type not supported
- `CHANNEL_DISABLED`: Requested channel is disabled
- `PERMISSION_DENIED`: Insufficient permissions

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File exceeds maximum size of 100MB",
    "details": {
      "fileSize": "150MB",
      "maxSize": "100MB",
      "file": "/path/to/large-file.pdf"
    }
  }
}
```

## Best Practices

### 1. File Preparation
- Compress large files before transfer
- Use descriptive filenames
- Include relevant metadata in captions

### 2. Context Awareness
- Group chats: Use `notifyAll: true` for team visibility
- Private chats: Keep notifications minimal
- Consider time zones for notifications

### 3. Performance
- Transfer files during off-peak hours
- Use appropriate file formats
- Monitor transfer speeds and adjust

### 4. Security
- Validate file types before transfer
- Implement size limits
- Log all transfer activities
- Consider encryption for sensitive files

## Integration Examples

### With GitHub Skill
```javascript
// Transfer GitHub issue attachments
const github = require('openclaw-github-skill');
const fileTransfer = require('openclaw-file-transfer-skill');

async function transferIssueAttachment(issueNumber) {
  const issue = await github.getIssue(issueNumber);
  const attachments = issue.attachments;
  
  for (const attachment of attachments) {
    await fileTransfer.sendFile({
      file: attachment.path,
      caption: `Attachment from issue #${issueNumber}`,
      options: { notifyAll: true }
    });
  }
}
```

### With Calendar Skill
```javascript
// Send meeting documents
const calendar = require('openclaw-calendar-skill');
const fileTransfer = require('openclaw-file-transfer-skill');

async function sendMeetingMaterials(meetingId) {
  const meeting = await calendar.getMeeting(meetingId);
  const materials = meeting.materials;
  
  for (const material of materials) {
    await fileTransfer.sendFile({
      file: material.file,
      caption: `Meeting material: ${meeting.title}`,
      options: { priority: "high" }
    });
  }
}
```

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

## Support

- **Documentation**: [GitHub Wiki](https://github.com/Ghostwritten/openclaw-file-transfer-skill/wiki)
- **Issues**: [GitHub Issues](https://github.com/Ghostwritten/openclaw-file-transfer-skill/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Ghostwritten/openclaw-file-transfer-skill/discussions)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.

## License

MIT License - see [LICENSE](LICENSE) for details.