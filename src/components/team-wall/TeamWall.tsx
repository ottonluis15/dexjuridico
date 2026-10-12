import React, { useState } from 'react';
import { 
  MessageSquare, 
  Pin, 
  Send, 
  Heart, 
  MessageCircle, 
  Share2, 
  Sparkles, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Trophy, 
  Megaphone,
  Trash2,
  AlertTriangle,
  Building2,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { WallPostCategory } from '../../types';

export const TeamWall: React.FC = () => {
  const { currentUser } = useAuth();
  const { userTeamPosts, addTeamPost, deleteTeamPost, toggleLikePost, showToast } = useData();

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<WallPostCategory>('COMUNICADO');
  const [isPosting, setIsPosting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      showToast('Por favor, preencha o título e o conteúdo do comunicado.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addTeamPost({
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory,
        isPinned: false
      });

      if (!res.success) {
        showToast(res.error || 'Erro ao gravar publicação no banco de dados.', 'error');
        return;
      }

      setNewPostTitle('');
      setNewPostContent('');
      setIsPosting(false);
      showToast('Publicação gravada e compartilhada com a equipe!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Erro inesperado ao salvar a publicação.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await toggleLikePost(postId);
      if (!res.success && res.error) {
        showToast(res.error, 'error');
      }
    } catch {
      showToast('Erro ao processar curtida.', 'error');
    }
  };

  const handleDeletePost = async (postId: string) => {
    const confirmed = window.confirm('Tem certeza? Esta ação não pode ser desfeita pela interface.');
    if (!confirmed) return;

    setIsDeletingId(postId);
    try {
      const res = await deleteTeamPost(postId);
      if (res.success) {
        showToast('Publicação removida com sucesso.', 'success');
      } else {
        showToast(res.error || 'Não foi possível remover a publicação.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Erro ao excluir publicação.', 'error');
    } finally {
      setIsDeletingId(null);
    }
  };

  const getCategoryBadge = (cat: WallPostCategory) => {
    switch (cat) {
      case 'VITORIA':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Vitória / Êxito
          </span>
        );
      case 'COMUNICADO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1">
            <Megaphone className="w-3 h-3" /> Comunicado
          </span>
        );
      case 'PRAZO_URGENTE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Alerta Urgente
          </span>
        );
      case 'EVENTO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Evento / Pauta
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Geral
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-400" />
            Mural da Equipe
          </h2>
          <p className="text-xs text-slate-400">
            Comunicação interna, avisos institucionais, celebrações de vitórias e alinhamentos
          </p>
        </div>

        <button
          onClick={() => setIsPosting(!isPosting)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Megaphone className="w-4 h-4" />
          {isPosting ? 'Cancelar' : 'Nova Publicação'}
        </button>
      </div>

      {/* New Post Box */}
      {isPosting && (
        <form onSubmit={handleCreatePost} className="p-5 rounded-2xl bg-slate-900/90 border border-brand-500/30 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Publicar no Mural do Escritório
            </h3>
            <select
              value={newPostCategory}
              onChange={(e) => setNewPostCategory(e.target.value as WallPostCategory)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            >
              <option value="COMUNICADO">📢 Comunicado Oficial</option>
              <option value="VITORIA">🏆 Vitória / Êxito Jurídico</option>
              <option value="PRAZO_URGENTE">⚠️ Alerta de Prazo</option>
              <option value="EVENTO">📅 Evento / Reunião</option>
              <option value="GERAL">💬 Assunto Geral</option>
            </select>
          </div>

          <input
            type="text"
            required
            placeholder="Título do aviso ou assunto..."
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />

          <textarea
            rows={3}
            required
            placeholder="Escreva a mensagem para toda a equipe..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPosting(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Descartar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Agora</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {userTeamPosts.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-semibold text-white">Nenhuma publicação no mural</h4>
            <p className="text-xs text-slate-400">
              Seja o primeiro a compartilhar um comunicado ou notícia com os membros do escritório.
            </p>
          </div>
        ) : (
          userTeamPosts.map((post) => {
            const isAuthor = currentUser?.id === post.authorId;
            const hasLiked = currentUser ? (post.likedBy || []).includes(currentUser.id) : false;

            return (
              <div
                key={post.id}
                className={`p-5 rounded-2xl bg-slate-900/80 border transition-all ${
                  post.isPinned 
                    ? 'border-brand-500/40 shadow-lg shadow-brand-950/30' 
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header / Author */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C69255] text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                      {post.authorInitial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{post.authorName}</span>
                        <span className="text-[10px] text-slate-400">• {post.authorRole}</span>
                        {post.officeName && !post.officeName.toLowerCase().includes('autônom') && post.officeId ? (
                          <span className="text-[10px] text-cyan-300 font-medium px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 flex items-center gap-1">
                            {post.officeLogoUrl ? (
                              <img src={post.officeLogoUrl} alt="" className="w-3 h-3 rounded-full object-cover" />
                            ) : (
                              <Building2 className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                            )}
                            <span className="truncate max-w-[220px]">{post.officeName}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-300 font-medium px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/50 flex items-center gap-1">
                            <UserCheck className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span>Advogado autônomo</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {post.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-800/60">
                        <Pin className="w-3 h-3" /> Fixado
                      </span>
                    )}
                    {getCategoryBadge(post.category)}

                    {/* Botão de Excluir (Soft Delete) apenas para o autor (Item 5) */}
                    {isAuthor && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={isDeletingId === post.id}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors ml-1 cursor-pointer disabled:opacity-40"
                        title="Apagar minha publicação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Body */}
                <div className="space-y-1.5 pl-0 sm:pl-13">
                  <h4 className="text-sm font-bold text-white tracking-tight">{post.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{post.content}</p>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    {/* Botão de Curtida com Toggle e Indicador Visual (Item 3) */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${
                        hasLiked ? 'text-rose-400 font-semibold' : 'hover:text-rose-400 text-slate-400'
                      }`}
                      title={hasLiked ? 'Remover curtida' : 'Curtir publicação'}
                    >
                      <Heart 
                        className={`w-4 h-4 transition-transform group-active:scale-125 ${
                          hasLiked 
                            ? 'text-rose-500 fill-rose-500' 
                            : 'text-slate-400 group-hover:text-rose-400'
                        }`} 
                      />
                      <span>{post.likes}</span>
                    </button>

                    <button 
                      onClick={() => showToast('Comentários em tempo real habilitados.', 'info')}
                      className="flex items-center gap-1.5 hover:text-brand-400 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                      <span>{post.commentsCount} respostas</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.origin + '/app');
                      showToast('Link do Mural copiado para a área de transferência!', 'info');
                    }}
                    className="hover:text-slate-200 transition-colors p-1 cursor-pointer"
                    title="Compartilhar"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
