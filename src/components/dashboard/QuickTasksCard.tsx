import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';

interface QuickTask {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = 'dex_quick_tasks';

const INITIAL_TASKS: QuickTask[] = [
  { id: '1', text: 'Protocolar contestação no processo 5001248-91', completed: false },
  { id: '2', text: 'Ligar para perito contábil sobre honorários', completed: false },
  { id: '3', text: 'Enviar minuta de procuração para Dr. Otton revisar', completed: true },
];

export const QuickTasksCard: React.FC = () => {
  const [tasks, setTasks] = useState<QuickTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [newTaskText, setNewTaskText] = useState('');
  const [isInputOpen, setIsInputOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: QuickTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    setIsInputOpen(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="bg-[#162B37] rounded-[24px] p-6 shadow-xl border border-[#214154]/40 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Título e Botão de Ação Rápida (Anexo 4) */}
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
            title="Adicionar tarefa"
            className="w-9 h-9 rounded-full bg-[#5A97A5] hover:bg-[#6BA7B5] text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </form>

        {/* Lista de Tarefas Interativas */}
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
                className="opacity-0 group-hover:opacity-100 p-1 text-[#A6C5CD] hover:text-dex-coral transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

