import React, { useState, useEffect } from 'react';
import { Plus, Trash, Key, AlertCircle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useChannelsStore } from '../../store/channelsStore';
import { useLanguage } from '../../contexts/LanguageContext';

const ChannelsManager: React.FC = () => {
  const [username, setUsername] = useState('');
  const [newChannelToken, setNewChannelToken] = useState('');
  const [channelTokens, setChannelTokens] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<{id: string, token: string} | null>(null);
  const { channels, isLoading, channelLimits, fetchChannels, fetchChannelLimits, addChannel, updateChannel, deleteChannel } = useChannelsStore();
  const { t } = useLanguage();

  // Helper function to replace placeholders in translation strings
  const formatMessage = (message: string, ...args: string[]) => {
    return args.reduce((msg, arg, index) => {
      return msg.replace(`{${index}}`, arg);
    }, message);
  };

  useEffect(() => {
    fetchChannels();
    fetchChannelLimits();
  }, [fetchChannels, fetchChannelLimits]);
  
  // Auto-clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    // Инициализация токенов из каналов
    const tokensObj: Record<string, string> = {};
    channels.forEach(channel => {
      // Handle both id and _id
      const channelId = channel._id || channel.id;
      if (channel.botToken && channelId) {
        tokensObj[channelId] = channel.botToken;
      }
    });
    setChannelTokens(tokensObj);
  }, [channels]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setError('');
  };

  const handleNewChannelTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewChannelToken(e.target.value);
  };

  const handleAddChannel = async () => {
    let formattedUsername = username.trim();

    // Validate username format
    if (!formattedUsername) {
      setError(t('channels_manager.error_username'));
      return;
    }

    // Add @ if it doesn't have one
    if (!formattedUsername.startsWith('@')) {
      formattedUsername = `@${formattedUsername}`;
    }

    // Check if channel already exists
    if (channels.some((channel) => channel.title === formattedUsername)) {
      setError(t('channels_manager.error_already_added'));
      return;
    }

    try {
      await addChannel({
        username: username,
        title: formattedUsername,
        botToken: newChannelToken,
      });
      setUsername('');
      setNewChannelToken('');
    } catch (error) {
      if (error instanceof Error && error.name === 'ChannelLimitError') {
        // This is a channel limit error, show a specific message
        setError(t('channels_manager.error_limit_reached'));
      } else {
        setError(t('channels_manager.error_add_failed'));
      }
    }
  };

  // Format channel limit text
  const getLimitText = () => {
    if (!channelLimits) return '';
    
    const { current, limit } = channelLimits;
    
    if (limit === -1) {
      return t('channels_manager.unlimited_channels');
    } else {
      return formatMessage(t('channels_manager.channels_limit'), `${current}`, `${limit}`);
    }
  };

  // Check if we've reached the channel limit
  const isChannelLimitReached = channelLimits ? 
    (channelLimits.limit !== -1 && channelLimits.current >= channelLimits.limit) : 
    false;

  const openTokenModal = (channelId: string) => {
    if (!channelId) return;
    const currentToken = channelTokens[channelId] || '';
    setEditingChannel({id: channelId, token: currentToken});
    setTokenModalOpen(true);
  };

  const closeTokenModal = () => {
    setTokenModalOpen(false);
    setEditingChannel(null);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingChannel) {
      setEditingChannel({...editingChannel, token: e.target.value});
    }
  };

  const confirmTokenUpdate = async () => {
    if (editingChannel && editingChannel.id) {
      try {
        await updateChannel(editingChannel.id, { botToken: editingChannel.token });
        setChannelTokens(prev => ({
          ...prev,
          [editingChannel.id]: editingChannel.token
        }));
        await fetchChannels(); // Then refresh the channels list
        closeTokenModal();
      } catch {
        setError(t('channels_manager.error_save_token'));
      }
    }
  };

  const openDeleteModal = (channelId: string) => {
    if (!channelId) return;
    setChannelToDelete(channelId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setChannelToDelete(null);
  };

  const confirmDeleteChannel = async () => {
    if (channelToDelete) {
      try {
        await deleteChannel(channelToDelete);
        closeDeleteModal(); // Close the modal first
        await fetchChannels(); // Then refresh the channels list
      } catch {
        setError(t('channels_manager.error_delete_channel'));
        closeDeleteModal();
      }
    }
  };

  // Найти название канала для удаления (для использования в сообщении)
  const channelToDeleteName = channelToDelete 
    ? channels.find(c => (c._id === channelToDelete || c.id === channelToDelete))?.title || 'этот канал'
    : '';

  // Найти название канала для редактирования токена
  const editingChannelName = editingChannel?.id
    ? channels.find(c => (c._id === editingChannel.id || c.id === editingChannel.id))?.title || 'этот канал'
    : '';

  return (
    <>
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>{t('channels_manager.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-md flex items-start">
              <AlertCircle size={18} className="text-red-500 mr-2 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Channel Limits Info Banner */}
          {channelLimits && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded-r-md flex items-start">
              <Info size={18} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700 font-medium">{getLimitText()}</p>
                {isChannelLimitReached && (
                  <p className="text-xs text-blue-600 mt-1">
                    {t('channels_manager.upgrade_subscription')}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className='mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100'>
            <h4 className='text-sm font-medium text-blue-800 mb-2'>{t('channels_manager.add_new_channel')}</h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-3'>
              <Input
                placeholder={t('channels_manager.channel_username')}
                value={username}
                onChange={handleUsernameChange}
                fullWidth
                disabled={isChannelLimitReached}
              />
              <Input
                placeholder={t('channels_manager.bot_token')}
                value={newChannelToken}
                onChange={handleNewChannelTokenChange}
                icon={<Key size={16} className="text-gray-400" />}
                fullWidth
                disabled={isChannelLimitReached}
              />
            </div>
            <Button
              onClick={handleAddChannel}
              isLoading={isLoading}
              disabled={isLoading || !username.trim() || isChannelLimitReached}
              leftIcon={<Plus size={16} />}
              className="w-full md:w-auto"
              variant={isChannelLimitReached ? "danger" : "primary"}
            >
              {isChannelLimitReached 
                ? t('channels_manager.limit_reached') 
                : t('channels_manager.add_channel')}
            </Button>
          </div>

          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-gray-700 mb-2'>
              {t('channels_manager.connected_channels')}
            </h4>

            {channels.length === 0 ? (
              <div className='text-sm text-gray-500 italic p-4 bg-gray-50 rounded-md'>
                {t('channels_manager.no_connected_channels')}
              </div>
            ) : (
              <ul className='divide-y divide-gray-200 bg-white rounded-lg border border-gray-200'>
                {channels.map((channel) => {
                  const channelId = channel._id || channel.id;
                  return (
                    <li
                      key={channelId}
                      className='p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3'
                    >
                      <div className='flex-shrink-0 min-w-[200px]'>
                        <p className='text-sm font-medium text-gray-900'>
                          {channel.title}
                        </p>
                        <p className='text-xs text-gray-500'>{channel.username}</p>
                      </div>
                      
                      <div className='flex-grow flex items-center gap-2'>
                        <div className="flex-grow text-sm">
                          {channel.botToken ? (
                            <div className="flex items-center">
                              <span className="text-gray-500 mr-2">
                                <Key size={16} />
                              </span>
                              <span className="text-gray-700">{t('channels_manager.token_configured')}</span>
                            </div>
                          ) : (
                            <span className="text-amber-500">{t('channels_manager.token_not_configured')}</span>
                          )}
                        </div>
                        
                        <Button
                          variant='outline'
                          size='sm'
                          leftIcon={<Key size={16} />}
                          onClick={() => openTokenModal(channelId)} 
                          className='shrink-0'
                        >
                          {channel.botToken ? t('channels_manager.change_token') : t('channels_manager.add_token')}
                        </Button>
                      </div>
                      
                      <Button
                        variant='ghost'
                        size='sm'
                        leftIcon={<Trash size={16} className='text-red-500' />}
                        className='text-red-500 hover:bg-red-50 shrink-0'
                        onClick={() => openDeleteModal(channelId)}
                      >
                        {t('channels_manager.delete')}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title={t('channels_manager.delete_channel')}
        message={formatMessage(t('channels_manager.delete_confirmation'), channelToDeleteName)}
        confirmText={t('channels_manager.confirm_delete')}
        cancelText={t('channels_manager.cancel')}
        confirmType="danger"
        onConfirm={confirmDeleteChannel}
        onCancel={closeDeleteModal}
      />

      {/* Модальное окно для редактирования токена */}
      {tokenModalOpen && editingChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {formatMessage(t('channels_manager.token_setup'), editingChannelName)}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 focus:outline-none" 
                onClick={closeTokenModal}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600 mb-4">{t('channels_manager.enter_token')}</p>
              <Input
                placeholder={t('channels_manager.bot_token')}
                value={editingChannel.token}
                onChange={handleTokenChange}
                icon={<Key size={16} className="text-gray-400" />}
                fullWidth
                autoFocus
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <Button 
                variant="ghost" 
                onClick={closeTokenModal}
              >
                {t('channels_manager.cancel')}
              </Button>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-white"
                onClick={confirmTokenUpdate}
              >
                {t('channels_manager.save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChannelsManager;
