import { useEffect, useRef } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { useTreeStore } from './store';

export const GestureController = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const setMode = useTreeStore(s => s.setMode);
  
  useEffect(() => {
    let recognizer: GestureRecognizer;
    let animationFrameId: number;

    const setup = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      
      recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          predict();
        }
      }
    };

    const predict = () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const results = recognizer.recognizeForVideo(videoRef.current, Date.now());
        
        if (results.gestures.length > 0) {
          // 简单逻辑：检测是否有"Open_Palm" 或 "Closed_Fist"
          // MediaPipe 手势名称: "Open_Palm", "Closed_Fist", "Pointing_Up", etc.
          
          let openPalmCount = 0;
          let fistCount = 0;

          results.gestures.forEach((hand) => {
             const name = hand[0].categoryName;
             if (name === 'Open_Palm') openPalmCount++;
             if (name === 'Closed_Fist') fistCount++;
          });

          // 双手打开 -> 爆炸
          if (openPalmCount >= 2) {
            setMode('exploded');
          }
          // 双手握拳 -> 恢复
          if (fistCount >= 2) {
            setMode('tree');
          }
        }
      }
      animationFrameId = requestAnimationFrame(predict);
    };

    setup();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current?.srcObject) {
         (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [setMode]);

  return (
    <video 
      ref={videoRef} 
      className="fixed bottom-4 left-4 w-32 h-24 object-cover opacity-50 z-50 rounded-lg border-2 border-gold pointer-events-none"
      muted 
      playsInline 
    />
  );
};