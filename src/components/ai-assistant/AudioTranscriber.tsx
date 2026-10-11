import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  FileAudio,
  Radio
} from 'lucide-react';

interface AudioTranscriberProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptionComplete: (text: string) => void;
}

export const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  isOpen,
  onClose,
  onTranscriptionComplete
}) => {
  const [activeTab, setActiveTab] = useState<'RECORD' | 'UPLOAD'>('RECORD');
  const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Limpeza de streams e timers ao fechar
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    setErrorMessage(null);
    setStatus('recording');
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador não suporta gravação de áudio pelo microfone.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/ogg');

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250);

      // Inicia timer de gravação
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      stopRecordingCleanup();
      setStatus('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Permissão de microfone negada. Autorize o acesso ao microfone no navegador.');
      } else {
        setErrorMessage(err.message || 'Não foi possível acessar o microfone.');
      }
    }
  };

  const handleStopAndTranscribe = async () => {
    if (!mediaRecorderRef.current) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const mime = mediaRecorderRef.current.mimeType || 'audio/webm';

    mediaRecorderRef.current.onstop = async () => {
      // Para as faixas do microfone
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      const blob = new Blob(audioChunksRef.current, { type: mime });
      if (blob.size === 0) {
        setStatus('error');
        setErrorMessage('Gravação vazia. Fale algo próximo ao microfone antes de parar.');
        return;
      }

      await sendAudioForTranscription(blob, mime);
    };

    try {
      mediaRecorderRef.current.stop();
    } catch {
      setStatus('error');
      setErrorMessage('Erro ao finalizar gravação.');
    }
  };

  const handleCancelRecording = () => {
    stopRecordingCleanup();
    setStatus('idle');
    setRecordingSeconds(0);
    setErrorMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Limite razoável de 25 MB
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setStatus('error');
      setErrorMessage('Arquivo de áudio excede o limite máximo permitido de 25 MB.');
      setSelectedFile(null);
      return;
    }

    const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.webm'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setStatus('error');
      setErrorMessage('Formato de áudio não suportado. Utilize MP3, WAV, M4A, OGG ou WEBM.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setStatus('idle');
  };

  const handleUploadAndTranscribe = async () => {
    if (!selectedFile) {
      setErrorMessage('Selecione um arquivo de áudio do seu computador.');
      return;
    }

    const mime = selectedFile.type || 'audio/mp3';
    await sendAudioForTranscription(selectedFile, mime);
  };

  const sendAudioForTranscription = async (fileOrBlob: Blob | File, mimeType: string) => {
    setStatus('transcribing');
    setErrorMessage(null);

    try {
      // Converte Blob/File em Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          const base64Data = res.split(',')[1] || '';
          resolve(base64Data);
        };
        reader.onerror = reject;
      });

      reader.readAsDataURL(fileOrBlob);
      const audioBase64 = await base64Promise;

      // Envia para o backend seguro em /api/transcribe
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audioBase64,
          mimeType
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao transcrever o áudio pela API.');
      }

      const text = data.text?.trim() || '';
      if (!text) {
        throw new Error('Nenhum texto pôde ser extraído do áudio.');
      }

      setStatus('success');
      setTimeout(() => {
        onTranscriptionComplete(text);
        onClose();
      }, 700);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Erro ao processar transcrição do áudio.');
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative text-slate-100">
        {/* Close Button */}
        <button
          onClick={() => {
            stopRecordingCleanup();
            onClose();
          }}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Transcrição de Áudio com IA
              <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                Gemini
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Grave sua voz ou envie um áudio do cliente em Português do Brasil
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-800/80 rounded-xl mb-5 border border-slate-700/60">
          <button
            type="button"
            disabled={status === 'recording' || status === 'transcribing'}
            onClick={() => {
              setActiveTab('RECORD');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'RECORD'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Gravar Microfone</span>
          </button>

          <button
            type="button"
            disabled={status === 'recording' || status === 'transcribing'}
            onClick={() => {
              setActiveTab('UPLOAD');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'UPLOAD'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Enviar Arquivo</span>
          </button>
        </div>

        {/* Tab 1: Gravar Microfone */}
        {activeTab === 'RECORD' && (
          <div className="space-y-5 text-center py-2">
            {status === 'recording' ? (
              <div className="space-y-4">
                {/* Indicador pulsante */}
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-rose-500/20 animate-ping absolute" />
                  <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-950/80 relative">
                    <Mic className="w-7 h-7" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-2xl font-mono font-extrabold text-white">
                    {formatTimer(recordingSeconds)}
                  </span>
                  <p className="text-xs text-rose-300 font-medium flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Gravando relato em tempo real...
                  </p>
                </div>

                {/* Botões de Parar e Cancelar */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelRecording}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleStopAndTranscribe}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/60 transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Concluir &amp; Transcrever</span>
                  </button>
                </div>
              </div>
            ) : status === 'transcribing' ? (
              <div className="py-6 space-y-3">
                <div className="w-10 h-10 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-white">Transcrevendo áudio...</h4>
                <p className="text-xs text-slate-400">
                  A IA do Google Gemini está convertendo o áudio em texto em Português (Brasil).
                </p>
              </div>
            ) : status === 'success' ? (
              <div className="py-6 space-y-2 text-emerald-400">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <h4 className="text-sm font-bold text-white">Transcrição Concluída!</h4>
                <p className="text-xs text-slate-300">Inserindo texto no campo de relato...</p>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
                  <Mic className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pronto para gravar</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Clique no botão abaixo para começar a falar. O áudio será transcrito com precisão.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/60 transition-all cursor-pointer"
                >
                  <Radio className="w-4 h-4" />
                  <span>Iniciar Gravação pelo Microfone</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Enviar Arquivo de Áudio */}
        {activeTab === 'UPLOAD' && (
          <div className="space-y-4 py-2">
            {status === 'transcribing' ? (
              <div className="py-6 space-y-3 text-center">
                <div className="w-10 h-10 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-white">Transcrevendo arquivo de áudio...</h4>
                <p className="text-xs text-slate-400">
                  Processando via Google Gemini em Português do Brasil...
                </p>
              </div>
            ) : status === 'success' ? (
              <div className="py-6 space-y-2 text-emerald-400 text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <h4 className="text-sm font-bold text-white">Transcrição Concluída!</h4>
                <p className="text-xs text-slate-300">Inserindo texto no campo de relato...</p>
              </div>
            ) : (
              <>
                <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-800/40 text-center block">
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a,.ogg,.webm,audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <FileAudio className="w-8 h-8 text-cyan-400 mb-2" />
                  <span className="text-xs font-bold text-white block">
                    {selectedFile ? selectedFile.name : 'Escolher arquivo de áudio'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {selectedFile 
                      ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Clique para trocar`
                      : 'MP3, WAV, M4A, OGG ou WEBM (máx. 25 MB)'
                    }
                  </span>
                </label>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleUploadAndTranscribe}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/60 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Transcrever {selectedFile.name}</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Mensagem de Erro (se houver) */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Rodapé Informativo */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-[10px] text-slate-500">
          O áudio não é retido e é processado estritamente para transcrição conforme a LGPD.
        </div>
      </div>
    </div>
  );
};
