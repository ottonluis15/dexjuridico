import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Feather } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { QuickTask } from '../../types';

export const QuickTasksCard: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || '';
  const isDemo = !!currentUser?.isDemo;

  const [tasks, setTasks] = useState<QuickTask[]>(() => {
    return storageService.getQuickTasks(userId, isDemo);
  });

  const [newTaskText, setNewTaskText] = useState('');

  // Atualiza tarefas quando o usuário logado muda
  useEffect(() => {
    if (!userId) {
      setTasks([]);
      return;
    }
    const localTasks = storageService.getQuickTasks(userId, isDemo);
    setTasks(localTasks);

    // Se o Supabase estiver configurado, busca as tarefas remotas do usuário
    if (isSupabaseConfigured()) {
      supabaseService.fetchQuickTasks(userId).then(remote => {
        if (remote) {
          setTasks(remote);
          storageService.saveQuickTasks(userId, remote);
        }
      }).catch(console.warn);
    }
  }, [userId, isDemo]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !userId) return;

    const newTask: QuickTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      officeId: currentUser?.officeId,
      text: newTaskText.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    storageService.saveQuickTasks(userId, updated);
    setNewTaskText('');

    if (isSupabaseConfigured()) {
      supabaseService.upsertQuickTask(newTask, userId, currentUser?.officeId).catch(console.warn);
    }
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    if (userId) {
      storageService.saveQuickTasks(userId, updated);
      const target = updated.find(t => t.id === id);
      if (target && isSupabaseConfigured()) {
        supabaseService.upsertQuickTask(target, userId, currentUser?.officeId).catch(console.warn);
      }
    }
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    if (userId) {
      storageService.saveQuickTasks(userId, updated);
      if (isSupabaseConfigured()) {
        supabaseService.deleteQuickTask(id).catch(console.warn);
      }
    }
  };

  return (
    <div className="bg-[#162B37] rounded-[24px] p-6 shadow-xl border border-[#214154]/40 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Título e Contador de Pendências (Anexo 4) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#214154]/60">
          <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
            Tarefas rápidas
          </h3>
          <span className="text-xs text-[#A6C5CD] font-serif">
            {tasks.filter(t => !t.completed).length} pendentes
          </span>
        </div>

        {/* Bloco "O que precisa ser feito?" + botão circular "+" (Anexo 4) */}
        <form onSubmit={handleAddTask} className="flex items-center gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="O que precisa ser feito?"
            className="flex-1 px-4 py-2.5 rounded-full bg-white/10 text-white placeholder:text-[#A6C5CD]/70 text-xs font-serif border border-white/15 focus:outline-none focus:ring-2 focus:ring-dex-coral transition-all"
          />
          <button
            type="submit"
            title="Adicionar tarefa rápida"
            aria-label="Adicionar tarefa rápida"
            className="w-9 h-9 rounded-full bg-[#5A97A5] hover:bg-[#6BA7B5] text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </form>

        {/* Lista de Tarefas ou Estado Vazio Amigável */}
        {tasks.length === 0 ? (
          <div className="py-7 px-3 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-[#A6C5CD]/60">
              <Feather className="w-4 h-4 stroke-[1.5]" />
            </div>
            <p className="text-xs text-white/90 font-serif font-medium">
              Nenhuma tarefa rápida pendente
            </p>
            <p className="text-[11px] text-[#A6C5CD]/70 font-serif max-w-xs leading-relaxed">
              Digite acima e clique em + para organizar lembretes e anotações do seu dia.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pt-1">
            {tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <div
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      task.completed
                        ? 'bg-dex-coral border-dex-coral text-white'
                        : 'border-white/40 hover:border-white'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs font-serif truncate ${
                      task.completed
                        ? 'line-through text-[#A6C5CD]/70'
                        : 'text-[#EAE0DA]'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  aria-label="Excluir tarefa"
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#A6C5CD] hover:text-dex-coral transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
