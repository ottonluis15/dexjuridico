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
  Building2, 
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { WallPostCategory } from '../../types';
import { InternalPageLayout } from '../layout/InternalPageLayout';

export const TeamWall: React.FC = () => {
  const { currentUser } = useAuth();
  const { userTeamPosts, addTeamPost, deleteTeamPost, toggleLikePost, showToast } = useData();

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<WallPostCategory>('COMUNICADO');
  const [isPosting, setIsPosting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

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
    const confirmed = window.confirm('Tem certeza? Esta ação não pode ser desfeita.');
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
          <span className="px-3 py-1 rounded-full text-[10px] font-serif font-bold bg-dex-kpi-peach text-dex-navy-950 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-dex-coral" /> Vitória
          </span>
        );
      case 'COMUNICADO':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-serif font-bold bg-dex-kpi-mint text-dex-navy-950 flex items-center gap-1">
            <Megaphone className="w-3 h-3" /> Comunicado
          </span>
        );
      case 'PRAZO_URGENTE':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-serif font-bold bg-dex-coral text-white flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Urgente
          </span>
        );
      case 'EVENTO':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-serif font-bold bg-dex-kpi-purple text-dex-navy-950 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Evento
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-serif font-bold bg-dex-navy-950 text-dex-beige">
            Geral
          </span>
        );
    }
  };

  const totalPosts = userTeamPosts.length;
  const vitoriasCount = userTeamPosts.filter(p => p.category === 'VITORIA').length;
  const comunicadosCount = userTeamPosts.filter(p => p.category === 'COMUNICADO').length;
  const urgentesCount = userTeamPosts.filter(p => p.category === 'PRAZO_URGENTE').length;

  const kpis = [
    {
      title: 'Total de Publicações',
      value: totalPosts,
      icon: MessageSquare,
      iconTileColor: 'peach' as const
    },
    {
      title: 'Vitórias & Êxitos',
      value: vitoriasCount,
      icon: Trophy,
      iconTileColor: 'mint' as const
    },
    {
      title: 'Comunicados Oficiais',
      value: comunicadosCount,
      icon: Megaphone,
      iconTileColor: 'purple' as const
    },
    {
      title: 'Prazos & Alertas',
      value: urgentesCount,
      icon: AlertCircle,
      iconTileColor: 'cream' as const
    }
  ];

  const filteredPosts = userTeamPosts.filter(p => {
    if (filterCategory === 'ALL') return true;
    return p.category === filterCategory;
  });

  return (
    <InternalPageLayout
      title="Mural da Equipe"
      subtitle="Comunicação interna, avisos institucionais e alinhamentos de equipe"
      actionLabel={isPosting ? 'Fechar Publicação' : 'Nova Publicação'}
      onAction={() => setIsPosting(!isPosting)}
      kpis={kpis}
      filters={[
        { label: 'Todos', active: filterCategory === 'ALL', onClick: () => setFilterCategory('ALL') },
        { label: 'Comunicados', active: filterCategory === 'COMUNICADO', onClick: () => setFilterCategory('COMUNICADO') },
        { label: 'Vitórias', active: filterCategory === 'VITORIA', onClick: () => setFilterCategory('VITORIA') },
        { label: 'Urgentes', active: filterCategory === 'PRAZO_URGENTE', onClick: () => setFilterCategory('PRAZO_URGENTE') },
        { label: 'Eventos', active: filterCategory === 'EVENTO', onClick: () => setFilterCategory('EVENTO') }
      ]}
    >
      <div className="space-y-6">
        {/* Form de Nova Publicação */}
        {isPosting && (
          <form onSubmit={handleCreatePost} className="p-6 rounded-[24px] bg-dex-navy-800 border border-dex-coral/30 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-dex-coral" />
                Publicar no Mural do Escritório
              </h3>
              <select
                value={newPostCategory}
                onChange={(e) => setNewPostCategory(e.target.value as WallPostCategory)}
                className="px-3 py-1.5 bg-dex-input text-dex-navy-950 font-serif rounded-lg text-xs"
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
              className="w-full px-4 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-dex-coral"
            />

            <textarea
              rows={4}
              required
              placeholder="Escreva a mensagem para toda a equipe..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full px-4 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-dex-coral resize-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPosting(false)}
                className="px-4 py-2 text-xs font-serif text-slate-300 hover:text-white transition-colors"
              >
                Descartar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-dex-coral hover:bg-dex-coral/90 disabled:opacity-50 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <span>Salvando...</span>
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

        {/* Feed de Publicações */}
        {filteredPosts.length === 0 ? (
          <div className="p-12 rounded-[24px] bg-dex-navy-800 border border-white/5 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-[#8F8A87] mx-auto" />
            <h4 className="font-serif text-base font-bold text-white">Nenhuma publicação no mural</h4>
            <p className="text-xs text-[#8F8A87] font-serif">
              Seja o primeiro a compartilhar um comunicado ou notícia com os membros do escritório.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const isAuthor = currentUser?.id === post.authorId;
              const hasLiked = currentUser ? (post.likedBy || []).includes(currentUser.id) : false;

              return (
                <div
                  key={post.id}
                  className={`p-6 rounded-[24px] bg-dex-navy-800 border transition-all ${
                    post.isPinned 
                      ? 'border-dex-coral/50 shadow-xl' 
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-dex-coral text-white flex items-center justify-center font-serif font-bold text-sm shadow-md shrink-0">
                        {post.authorInitial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-xs font-bold text-white">{post.authorName}</span>
                          <span className="text-[10px] text-[#8F8A87] font-serif">• {post.authorRole}</span>
                          {post.officeName && !post.officeName.toLowerCase().includes('autônom') && post.officeId ? (
                            <span className="text-[10px] font-serif text-dex-peach px-2 py-0.5 rounded-full bg-dex-navy-950 border border-white/5 flex items-center gap-1">
                              <Building2 className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate max-w-[200px]">{post.officeName}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-serif text-dex-beige px-2 py-0.5 rounded-full bg-dex-navy-950 border border-white/5 flex items-center gap-1">
                              <UserCheck className="w-2.5 h-2.5 shrink-0" />
                              <span>Advogado autônomo</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8F8A87] font-serif flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {post.createdAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-serif font-bold text-dex-coral bg-dex-coral/20 px-2.5 py-0.5 rounded-md border border-dex-coral/30">
                          <Pin className="w-3 h-3" /> Fixado
                        </span>
                      )}
                      {getCategoryBadge(post.category)}

                      {isAuthor && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={isDeletingId === post.id}
                          className="p-1.5 text-[#8F8A87] hover:text-dex-coral rounded-lg transition-colors ml-1 disabled:opacity-40"
                          title="Apagar minha publicação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 pl-0 sm:pl-13">
                    <h4 className="font-serif text-base font-bold text-white tracking-tight">{post.title}</h4>
                    <p className="font-serif text-xs text-slate-200 leading-relaxed whitespace-pre-line">{post.content}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-serif text-[#8F8A87]">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          hasLiked ? 'text-dex-coral font-bold' : 'hover:text-dex-coral text-[#8F8A87]'
                        }`}
                        title={hasLiked ? 'Remover curtida' : 'Curtir publicação'}
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            hasLiked ? 'text-dex-coral fill-dex-coral' : 'text-[#8F8A87]'
                          }`} 
                        />
                        <span>{post.likes}</span>
                      </button>

                      <button 
                        onClick={() => showToast('Comentários em tempo real habilitados.', 'info')}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentsCount} respostas</span>
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.origin + '/app');
                        showToast('Link do Mural copiado para a área de transferência!', 'info');
                      }}
                      className="hover:text-white transition-colors p-1"
                      title="Compartilhar"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </InternalPageLayout>
  );
};
