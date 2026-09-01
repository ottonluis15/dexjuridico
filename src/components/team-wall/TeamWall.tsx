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
  Megaphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface WallPost {
  id: string;
  authorName: string;
  authorRole: string;
  authorInitial: string;
  createdAt: string;
  title: string;
  content: string;
  category: 'COMUNICADO' | 'VITORIA' | 'PRAZO_URGENTE' | 'EVENTO' | 'GERAL';
  isPinned?: boolean;
  likes: number;
  commentsCount: number;
}

export const TeamWall: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useData();

  const [posts, setPosts] = useState<WallPost[]>([
    {
      id: 'post_1',
      authorName: 'Dra. Helena Moreira',
      authorRole: 'Sócia Fundadora',
      authorInitial: 'H',
      createdAt: 'Hoje às 09:15',
      title: '🎉 Grande Vitória no TRF-3 — Tese de Exclusão do ICMS-ST!',
      content: 'Parabéns a toda a equipe tributária! Obtivemos decisão unânime favorável na 6ª Turma do TRF-3 em favor da TechVanguard. Compensação estimada em mais de R$ 800 mil. Excelente trabalho de todos os envolvidos!',
      category: 'VITORIA',
      isPinned: true,
      likes: 12,
      commentsCount: 4,
    },
    {
      id: 'post_2',
      authorName: 'Dr. Lucas Mendes',
      authorRole: 'Advogado Associado',
      authorInitial: 'L',
      createdAt: 'Ontem às 16:40',
      title: '📢 Recesso Forense e Escala de Prazos',
      content: 'Lembramos a todos os colegas que as pautas de audiências da próxima semana já estão atualizadas no sistema. Favor revisar os despachos e juntada de documentos com 48h de antecedência.',
      category: 'COMUNICADO',
      isPinned: true,
      likes: 8,
      commentsCount: 2,
    },
    {
      id: 'post_3',
      authorName: 'Dra. Beatriz Albuquerque',
      authorRole: 'Advogada Associada',
      authorInitial: 'B',
      createdAt: '26 de Agosto às 11:20',
      title: '💡 Treinamento sobre a Nova Dex AI no Escritório',
      content: 'A triagem automatizada com inteligência artificial aumentou nossa velocidade de elaboração de peças em 40%. Para quem quiser dicas de prompts jurídicos avançados, estarei disponível nesta quinta às 15h.',
      category: 'GERAL',
      isPinned: false,
      likes: 6,
      commentsCount: 1,
    }
  ]);

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<WallPost['category']>('COMUNICADO');
  const [isPosting, setIsPosting] = useState(false);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      showToast('Por favor, preencha o título e o conteúdo do comunicado.', 'warning');
      return;
    }

    const newPost: WallPost = {
      id: `post_${Date.now()}`,
      authorName: currentUser?.name || 'Advogado Dex',
      authorRole: currentUser?.role === 'ADMIN' ? 'Sócia / Administradora' : 'Advogado',
      authorInitial: (currentUser?.name?.[0] || 'D').toUpperCase(),
      createdAt: 'Agora mesmo',
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      isPinned: false,
      likes: 0,
      commentsCount: 0,
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setIsPosting(false);
    showToast('Publicação enviada para o Mural da Equipe!', 'success');
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const getCategoryBadge = (cat: WallPost['category']) => {
    switch (cat) {
      case 'VITORIA':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Trophy className="w-3 h-3" /> Vitória / Êxito</span>;
      case 'COMUNICADO':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1"><Megaphone className="w-3 h-3" /> Comunicado</span>;
      case 'PRAZO_URGENTE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Alerta Urgente</span>;
      case 'EVENTO':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1"><Calendar className="w-3 h-3" /> Evento / Pauta</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">Geral</span>;
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
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto"
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
              onChange={(e) => setNewPostCategory(e.target.value as WallPost['category'])}
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
            placeholder="Título do aviso ou assunto..."
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />

          <textarea
            rows={3}
            placeholder="Escreva a mensagem para toda a equipe..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPosting(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Publicar Agora
            </button>
          </div>
        </form>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{post.authorName}</span>
                    <span className="text-[10px] text-slate-400">• {post.authorRole}</span>
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
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 hover:text-rose-400 transition-colors group"
                >
                  <Heart className={`w-4 h-4 ${post.likes > 0 ? 'text-rose-400 fill-rose-400/20' : 'text-slate-400 group-hover:text-rose-400'}`} />
                  <span>{post.likes}</span>
                </button>

                <button 
                  onClick={() => showToast('Comentários em tempo real habilitados.', 'info')}
                  className="flex items-center gap-1.5 hover:text-brand-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  <span>{post.commentsCount} respostas</span>
                </button>
              </div>

              <button 
                onClick={() => showToast('Link da postagem copiado!', 'info')}
                className="hover:text-slate-200 transition-colors p-1"
                title="Compartilhar"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
