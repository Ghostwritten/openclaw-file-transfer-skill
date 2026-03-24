/**
 * OpenClaw File Transfer Skill - Main Entry Point
 * 
 * @module openclaw-file-transfer-skill
 * @version 0.1.0
 * @license MIT
 */

import { ContextEngine } from './core/context-engine.js';
import { FileManager } from './core/file-manager.js';
import { NotificationSystem } from './notifications/notification-system.js';
import { ConfigManager } from './utils/config-manager.js';
import { Logger } from './utils/logger.js';
import { TelegramAdapter } from './channels/telegram-adapter.js';
import { WhatsAppAdapter } from './channels/whatsapp-adapter.js';
import { DiscordAdapter } from './channels/discord-adapter.js';

/**
 * Main File Transfer Skill class
 */
class FileTransferSkill {
  /**
   * Create a new FileTransferSkill instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = new ConfigManager(config);
    this.logger = new Logger(this.config.get('logging'));
    
    // Initialize core components
    this.contextEngine = new ContextEngine();
    this.fileManager = new FileManager(this.config.get('file'));
    this.notificationSystem = new NotificationSystem(this.config.get('notifications'));
    
    // Initialize channel adapters
    this.channels = this.initializeChannels();
    
    this.logger.info('File Transfer Skill initialized', {
      version: '0.1.0',
      channels: Object.keys(this.channels)
    });
  }

  /**
   * Initialize channel adapters based on configuration
   * @returns {Object} Map of channel adapters
   * @private
   */
  initializeChannels() {
    const channels = {};
    const channelConfigs = this.config.get('channels', {});
    
    // Telegram
    if (channelConfigs.telegram?.enabled) {
      try {
        channels.telegram = new TelegramAdapter(channelConfigs.telegram);
        this.logger.debug('Telegram adapter initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Telegram adapter', { error: error.message });
      }
    }
    
    // WhatsApp
    if (channelConfigs.whatsapp?.enabled) {
      try {
        channels.whatsapp = new WhatsAppAdapter(channelConfigs.whatsapp);
        this.logger.debug('WhatsApp adapter initialized');
      } catch (error) {
        this.logger.error('Failed to initialize WhatsApp adapter', { error: error.message });
      }
    }
    
    // Discord
    if (channelConfigs.discord?.enabled) {
      try {
        channels.discord = new DiscordAdapter(channelConfigs.discord);
        this.logger.debug('Discord adapter initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Discord adapter', { error: error.message });
      }
    }
    
    return channels;
  }

  /**
   * Send a file with context-aware intelligence
   * @param {Object} options - File transfer options
   * @param {string} options.file - Path to the file
   * @param {string} [options.caption] - File description
   * @param {Object} [options.context] - Conversation context
   * @param {Object} [options.metadata] - Additional metadata
   * @returns {Promise<Object>} Transfer result
   */
  async sendFileWithContext(options) {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting context-aware file transfer', {
        file: options.file,
        context: options.context
      });

      // 1. Validate and prepare file
      const fileInfo = await this.fileManager.validateAndPrepare(options.file);
      
      // 2. Analyze context
      const contextAnalysis = this.contextEngine.analyze(options.context || {});
      
      // 3. Select appropriate channel
      const channel = this.selectChannel(fileInfo, contextAnalysis);
      
      // 4. Send progress notification
      await this.notificationSystem.sendProgress({
        file: fileInfo.name,
        progress: 0,
        context: contextAnalysis
      });
      
      // 5. Transfer file through selected channel
      const transferResult = await channel.sendFile(fileInfo, {
        caption: options.caption,
        context: contextAnalysis,
        metadata: options.metadata
      });
      
      // 6. Send completion notification
      await this.notificationSystem.sendCompletion({
        file: fileInfo.name,
        result: transferResult,
        context: contextAnalysis,
        duration: Date.now() - startTime
      });
      
      this.logger.info('File transfer completed successfully', {
        file: fileInfo.name,
        size: fileInfo.humanSize,
        duration: Date.now() - startTime,
        channel: channel.constructor.name
      });
      
      return {
        success: true,
        messageId: transferResult.messageId,
        context: contextAnalysis,
        stats: {
          size: fileInfo.humanSize,
          duration: Date.now() - startTime,
          channel: channel.constructor.name.replace('Adapter', '')
        }
      };
      
    } catch (error) {
      this.logger.error('File transfer failed', {
        file: options.file,
        error: error.message,
        duration: Date.now() - startTime
      });
      
      // Send error notification
      await this.notificationSystem.sendError({
        file: options.file,
        error: error.message,
        context: options.context
      });
      
      throw error;
    }
  }

  /**
   * Select appropriate channel based on file and context
   * @param {Object} fileInfo - File information
   * @param {Object} contextAnalysis - Context analysis
   * @returns {ChannelAdapter} Selected channel adapter
   * @private
   */
  selectChannel(fileInfo, contextAnalysis) {
    // Priority: context preference -> file type -> channel availability
    const availableChannels = Object.values(this.channels).filter(channel => 
      channel.isAvailable() && channel.canHandle(fileInfo)
    );
    
    if (availableChannels.length === 0) {
      throw new Error('No available channels can handle this file');
    }
    
    // For group chats, prefer channels with better group support
    if (contextAnalysis.scene === 'group') {
      const groupChannels = availableChannels.filter(channel => 
        channel.getCapabilities().groupSupport
      );
      if (groupChannels.length > 0) {
        return groupChannels[0]; // First group-capable channel
      }
    }
    
    // Return first available channel
    return availableChannels[0];
  }

  /**
   * List available files in a directory
   * @param {string} directory - Directory path
   * @param {Object} [filter] - Filter options
   * @returns {Promise<Object>} List of files
   */
  async listAvailableFiles(directory, filter = {}) {
    try {
      const files = await this.fileManager.listFiles(directory, filter);
      
      this.logger.debug('Listed available files', {
        directory,
        count: files.length,
        filter
      });
      
      return {
        files,
        total: files.length,
        directory
      };
      
    } catch (error) {
      this.logger.error('Failed to list files', {
        directory,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get transfer history
   * @param {Object} [options] - Query options
   * @returns {Promise<Object>} Transfer history
   */
  async getTransferHistory(options = {}) {
    // This would typically query a database
    // For now, return empty result
    return {
      history: [],
      stats: {
        total: 0,
        successful: 0,
        failed: 0
      }
    };
  }

  /**
   * Configure the skill
   * @param {Object} newConfig - New configuration
   */
  configure(newConfig) {
    this.config.update(newConfig);
    this.logger.info('Skill configuration updated');
    
    // Reinitialize channels if channel config changed
    if (newConfig.channels) {
      this.channels = this.initializeChannels();
    }
  }

  /**
   * Get skill status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      version: '0.1.0',
      channels: Object.keys(this.channels).map(name => ({
        name,
        available: this.channels[name].isAvailable(),
        capabilities: this.channels[name].getCapabilities()
      })),
      config: this.config.getSummary(),
      uptime: process.uptime()
    };
  }
}

// Export the main skill class
export { FileTransferSkill };

// Export individual components for advanced usage
export {
  ContextEngine,
  FileManager,
  NotificationSystem,
  ConfigManager,
  Logger,
  TelegramAdapter,
  WhatsAppAdapter,
  DiscordAdapter
};

// Default export for convenience
export default FileTransferSkill;