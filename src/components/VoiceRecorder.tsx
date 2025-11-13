import React, { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  language: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscription,
  language,
}) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Set up audio analysis for volume visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start volume level animation
      const updateVolume = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume level (0-100)
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const normalizedVolume = Math.min(100, (average / 255) * 150);
        setVolumeLevel(normalizedVolume);

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks and cleanup
        stream.getTracks().forEach(track => track.stop());
        
        // Cleanup audio context
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        setVolumeLevel(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Error',
        description: 'Could not access microphone',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];

        if (!base64Audio) {
          throw new Error('Failed to convert audio');
        }

        // Send to speech-to-text function
        const { data, error } = await supabase.functions.invoke('speech-to-text', {
          body: { audio: base64Audio, language },
        });

        if (error) throw error;

        if (data?.text) {
          onTranscription(data.text);
        }
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: 'Error',
        description: 'Failed to transcribe audio',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant={isRecording ? 'destructive' : 'outline'}
        size="sm"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className="w-full"
      >
        {isRecording ? (
          <>
            <Square className="h-4 w-4 mr-2" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Record Voice'}
          </>
        )}
      </Button>
      
      {/* Audio Waveform Visualization */}
      {isRecording && (
        <div className="space-y-2 animate-fade-in">
          {/* Volume Level Bars */}
          <div className="flex items-center justify-center gap-1 h-12">
            {[...Array(20)].map((_, index) => {
              // Create waveform effect - bars in center are taller
              const centerDistance = Math.abs(index - 10);
              const baseHeight = 100 - (centerDistance * 5);
              const heightMultiplier = volumeLevel / 100;
              const barHeight = Math.max(8, baseHeight * heightMultiplier);
              
              return (
                <div
                  key={index}
                  className="w-1 bg-gradient-to-t from-destructive to-destructive/50 rounded-full transition-all duration-75"
                  style={{
                    height: `${barHeight}%`,
                    animationDelay: `${index * 50}ms`,
                  }}
                />
              );
            })}
          </div>
          
          {/* Volume Indicator */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Volume Level</span>
              <span>{Math.round(volumeLevel)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-150 rounded-full"
                style={{ width: `${volumeLevel}%` }}
              />
            </div>
          </div>
          
          {/* Recording Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Recording in progress...</span>
          </div>
        </div>
      )}
    </div>
  );
};