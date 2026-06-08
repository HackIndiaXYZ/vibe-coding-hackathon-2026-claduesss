'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, User } from 'lucide-react';
import { useComments } from '@/hooks/useComments';

const INK = '#1A1040';

function timeAgo(date: string) {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  postId: string;
  postOwnerId: string;
  currentUserId?: string;
}

export default function CommentSection({ postId, postOwnerId, currentUserId }: Props) {
  const { comments, loading, submit, remove } = useComments(postId, postOwnerId, currentUserId);
  const [body,    setBody]    = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit() {
    if (!body.trim() || sending) return;
    setSending(true);
    await submit(body);
    setBody('');
    setSending(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ overflow: 'hidden', borderTop: `2px solid ${INK}` }}
    >
      <div className="px-4 py-3 flex flex-col gap-3">
        {/* Comment list */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-2 items-start">
                <div className="skeleton h-8 w-8 flex-shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-2.5 w-1/3 rounded" />
                  <div className="skeleton h-2.5 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs font-semibold text-center py-1" style={{ color: '#9CA3AF' }}>
            No comments yet. Be first!
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {comments.map(c => {
                const author = c.user as { username: string; display_name: string | null; avatar_url: string | null } | undefined;
                const isOwn = c.user_id === currentUserId;
                return (
                  <motion.li
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-start gap-2 group"
                  >
                    <div
                      className="flex-shrink-0 h-8 w-8 overflow-hidden flex items-center justify-center"
                      style={{ border: `2px solid ${INK}`, borderRadius: '6px', background: '#FFD93D' }}
                      aria-hidden="true"
                    >
                      {author?.avatar_url ? (
                        <img src={author.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User size={14} style={{ color: INK }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-black truncate" style={{ color: INK }}>
                          {author?.display_name ?? author?.username ?? 'Unknown'}
                        </span>
                        <span className="text-[10px] font-medium flex-shrink-0" style={{ color: '#9CA3AF' }}>
                          {timeAgo(c.created_at)}
                        </span>
                      </div>
                      <p className="text-xs font-medium leading-relaxed break-words" style={{ color: '#374151' }}>
                        {c.body}
                      </p>
                    </div>
                    {isOwn && (
                      <button
                        onClick={() => remove(c.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 rounded"
                        style={{ color: '#9CA3AF' }}
                        aria-label="Delete comment"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}

        {/* Input */}
        {currentUserId && (
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={body}
                onChange={e => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment…"
                maxLength={500}
                rows={1}
                className="w-full resize-none text-xs font-medium px-3 py-2 outline-none bg-white"
                style={{
                  border:       `2px solid ${INK}`,
                  boxShadow:    `2px 2px 0 ${INK}`,
                  borderRadius: '8px',
                  color:        INK,
                  lineHeight:   '1.5',
                  minHeight:    '36px',
                  maxHeight:    '80px',
                  overflowY:    'auto',
                }}
              />
              {body.length >= 400 && (
                <span
                  className="absolute bottom-1.5 right-2 text-[9px] font-bold"
                  style={{ color: body.length >= 480 ? '#EF4444' : '#9CA3AF' }}
                >
                  {500 - body.length}
                </span>
              )}
            </div>
            <motion.button
              onClick={handleSubmit}
              disabled={!body.trim() || sending}
              whileTap={body.trim() ? { scale: 0.9 } : {}}
              className="flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:   '#FFD93D',
                color:        INK,
                border:       `2px solid ${INK}`,
                boxShadow:    `2px 2px 0 ${INK}`,
                borderRadius: '8px',
                width:        '36px',
                height:       '36px',
              }}
              aria-label="Send comment"
            >
              <Send size={14} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
