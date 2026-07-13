import { useState, useEffect, useRef, useCallback, memo } from "react";
import * as tf from "@tensorflow/tfjs";
import { CameraIcon } from "@heroicons/react/24/solid";


const HandGestureDetector = memo(
  ({ onGestureDetected, onHandsDetected, onCameraReady, showDebugInfo = false, active = true }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const modelRef = useRef(null);
    const handsRef = useRef(null);
    const cameraRef = useRef(null);
    const activeRef = useRef(active);
    const onHandsDetectedRef = useRef(onHandsDetected);
    const onGestureDetectedRef = useRef(onGestureDetected);
    const onCameraReadyRef = useRef(onCameraReady);
    const [isLoading, setIsLoading] = useState(true);
    const [cameraError, setCameraError] = useState(null);
    const [detectedGesture, setDetectedGesture] = useState(null);
    const [confidence, setConfidence] = useState(null);
    const isInitializedRef = useRef(false);
    const lastDetectionTimeRef = useRef(0);
    const noHandFrameCountRef = useRef(0);
    const MAX_NO_HAND_FRAMES = 5;
    const wasHandVisibleRef = useRef(false);
    const [retryCount, setRetryCount] = useState(0);

    const [canvasDimensions, setCanvasDimensions] = useState({
      width: 640,
      height: 480,
    });


    useEffect(() => {
      activeRef.current = active;
    }, [active]);

    useEffect(() => {
      onHandsDetectedRef.current = onHandsDetected;
    }, [onHandsDetected]);

    useEffect(() => {
      onGestureDetectedRef.current = onGestureDetected;
    }, [onGestureDetected]);

    useEffect(() => {
      onCameraReadyRef.current = onCameraReady;
    }, [onCameraReady]);


    const labelMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const CONFIDENCE_THRESHOLD = 0.9;
    const DETECTION_COOLDOWN = 1000;

    const calculateCanvasDimensions = useCallback((videoWidth, videoHeight) => {
      if (!videoWidth || !videoHeight) {
        return { width: 640, height: 480 };
      }

      const videoAspectRatio = videoWidth / videoHeight;

      if (videoAspectRatio < 1) {
        return { width: 480, height: 640 };
      } else {

        return { width: 640, height: 480 };
      }
    }, []);


    useEffect(() => {
      if (isInitializedRef.current) return;

      let isMounted = true;
      console.log("Initializing HandGestureDetector");

      const loadResources = async () => {
        if (!isMounted) return;

        try {
          setIsLoading(true);
          setCameraError(null);

          try {
            modelRef.current = await tf.loadGraphModel("/model/model.json");
            console.log("✅ Model loaded successfully!");
          } catch (error) {
            console.error("❌ Failed to load model:", error);
          }

          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach((track) => track.stop());
          } catch (camError) {
            const msg =
              camError.name === "NotAllowedError"
                ? "Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser."
                : camError.name === "NotFoundError"
                  ? "Tidak ada kamera yang terdeteksi pada perangkat ini."
                  : `Gagal mengakses kamera: ${camError.message}`;
            throw new Error(msg);
          }

          const Hands = window.Hands;
          const Camera = window.Camera;

          if (!Hands || !Camera) {
            throw new Error(
              "MediaPipe libraries not loaded. Make sure to include the script tags."
            );
          }

          if (!videoRef.current) return;

          videoRef.current.addEventListener("loadedmetadata", () => {
            const { videoWidth, videoHeight } = videoRef.current;
            console.log(
              `Video stream dimensions: ${videoWidth}x${videoHeight}`
            );

            const newDimensions = calculateCanvasDimensions(
              videoWidth,
              videoHeight
            );
            console.log(
              `Setting canvas dimensions to: ${newDimensions.width}x${newDimensions.height}`
            );
            setCanvasDimensions(newDimensions);

            if (canvasRef.current) {
              canvasRef.current.width = newDimensions.width;
              canvasRef.current.height = newDimensions.height;
              console.log(
                `Canvas internal dimensions updated: ${canvasRef.current.width}x${canvasRef.current.height}`
              );
            }
          });

          videoRef.current.width = 640;
          videoRef.current.height = 480;

          if (!canvasRef.current) return;
          const ctx = canvasRef.current.getContext("2d");
          canvasRef.current.width = canvasDimensions.width;
          canvasRef.current.height = canvasDimensions.height;


          handsRef.current = new Hands({
            locateFile: (file) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
          });

          handsRef.current.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5,
            smoothLandmarks: true,
          });


          handsRef.current.onResults((results) => {
            if (!canvasRef.current || !isMounted) return;


            ctx.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );

            ctx.drawImage(
              videoRef.current,
              0,
              0,
              videoRef.current.videoWidth || canvasRef.current.width,
              videoRef.current.videoHeight || canvasRef.current.height,
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );


            const handCount = results.multiHandLandmarks
              ? results.multiHandLandmarks.length
              : 0;
            if (onHandsDetectedRef.current) {
              onHandsDetectedRef.current(handCount);
            }

            const handVisible = handCount > 0;


            if (wasHandVisibleRef.current && !handVisible) {
              console.log("Hand disappeared, clearing detected gesture");
              setDetectedGesture(null);
              setConfidence(null);


              if (onGestureDetectedRef.current && activeRef.current) {
                onGestureDetectedRef.current(null, 0);
              }
            }

            wasHandVisibleRef.current = handVisible;


            if (!handVisible) {
              return;
            }


            const fullHandVisible = isFullHandVisible(
              results.multiHandLandmarks
            );


            if (fullHandVisible) {
              for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                  color: "#7F00FF",
                  lineWidth: 2,
                });
                drawLandmarks(ctx, landmarks, {
                  color: "#0000FF",
                  lineWidth: 1,
                  radius: 0,
                });
              }
            }


            if (fullHandVisible && modelRef.current) {
              const now = Date.now();


              if (now - lastDetectionTimeRef.current > DETECTION_COOLDOWN) {
                const inputTensor = processLandmarks(
                  results.multiHandLandmarks
                );

                if (inputTensor) {
                  try {
                    const output = modelRef.current.predict(inputTensor);
                    const predictions = output.arraySync()[0];

                    const maxPrediction = Math.max(...predictions);
                    const predictedClass = predictions.indexOf(maxPrediction);
                    const confidenceValue = maxPrediction;

                    if (maxPrediction > CONFIDENCE_THRESHOLD) {
                      const gesture = labelMap[predictedClass];

                       setDetectedGesture(gesture);
                      setConfidence(confidenceValue);

                      if (onGestureDetectedRef.current && activeRef.current) {
                        lastDetectionTimeRef.current = now;
                        onGestureDetectedRef.current(gesture, confidenceValue);
                      }
                    } else {
                      console.log(
                        "Confidence too low, clearing detected gesture"
                      );
                      setDetectedGesture(null);
                      setConfidence(null);
                      if (onGestureDetectedRef.current && activeRef.current) {
                        onGestureDetectedRef.current(null, 0);
                      }
                    }


                    inputTensor.dispose();
                    tf.dispose(output);
                  } catch (error) {
                    console.error("Prediction error:", error);
                  }
                }
              }
            }
          });


          cameraRef.current = new Camera(videoRef.current, {
            onFrame: async () => {
              if (handsRef.current && isMounted) {
                try {
                  await handsRef.current.send({ image: videoRef.current });
                } catch (e) {
                  console.error("Error in camera frame processing:", e);
                }
              }
            },
            width: 640,
            height: 480,
          });

          await cameraRef.current.start();
          isInitializedRef.current = true;

          if (isMounted) {
            setIsLoading(false);
            onCameraReadyRef.current?.();
          }
        } catch (error) {
          console.error("Error initializing hand detection:", error);
          if (isMounted) {
            setIsLoading(false);
            setCameraError(error.message || "Terjadi kesalahan saat memuat kamera.");
          }
        }
      };


      function normalizeLandmarks(landmarks, wrist) {
        return landmarks.map((lm) => [
          lm.x - wrist.x,
          lm.y - wrist.y,
          lm.z - wrist.z,
        ]);
      }


      function scaleNormalization(coords) {
        if (!coords || coords.length === 0) return coords;

        let minX = coords[0][0], maxX = coords[0][0];
        let minY = coords[0][1], maxY = coords[0][1];
        let minZ = coords[0][2], maxZ = coords[0][2];

        for (let i = 1; i < coords.length; i++) {
          const [x, y, z] = coords[i];
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          if (z < minZ) minZ = z;
          if (z > maxZ) maxZ = z;
        }

        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        const rangeZ = maxZ - minZ;

        let s = Math.sqrt(rangeX * rangeX + rangeY * rangeY + rangeZ * rangeZ);
        if (s === 0) s = 1e-6;

        return coords.map(([x, y, z]) => [x / s, y / s, z / s]);
      }


      function processLandmarks(landmarks) {
        let features = [];

        if (landmarks.length === 1) {
          const leftHand = Array(63).fill(0);
          features.push(...leftHand);


          let rightHand = normalizeLandmarks(landmarks[0], landmarks[0][0]);
          rightHand = scaleNormalization(rightHand);
          rightHand.forEach((coord) => features.push(...coord));
        } else if (landmarks.length === 2) {
          const sortedHands = landmarks.sort((a, b) => a[0].x - b[0].x);
          
          let leftHand = normalizeLandmarks(sortedHands[0], sortedHands[0][0]);
          leftHand = scaleNormalization(leftHand);
          
          let rightHand = normalizeLandmarks(sortedHands[1], sortedHands[1][0]);
          rightHand = scaleNormalization(rightHand);

          leftHand.forEach((coord) => features.push(...coord));
          rightHand.forEach((coord) => features.push(...coord));
        }


        if (features.length !== 126) {
          features = Array(126).fill(0);
        }

        return tf.tensor2d([features], [1, 126]);
      }


      function drawConnectors(ctx, landmarks, connections, options) {
        const { color = "white", lineWidth = 1 } = options || {};
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        for (const connection of connections) {
          const [i, j] = connection;
          const from = landmarks[i];
          const to = landmarks[j];

          if (from && to) {
            ctx.beginPath();
            ctx.moveTo(from.x * ctx.canvas.width, from.y * ctx.canvas.height);
            ctx.lineTo(to.x * ctx.canvas.width, to.y * ctx.canvas.height);
            ctx.stroke();
          }
        }
      }


      function drawLandmarks(ctx, landmarks, options) {
        const { color = "red", lineWidth = 1, radius = 3 } = options || {};
        ctx.fillStyle = color;
        ctx.strokeStyle = "white";
        ctx.lineWidth = lineWidth;

        for (const landmark of landmarks) {
          ctx.beginPath();
          ctx.arc(
            landmark.x * ctx.canvas.width,
            landmark.y * ctx.canvas.height,
            radius,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.stroke();
        }
      }


      const HAND_CONNECTIONS = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [0, 5],
        [5, 6],
        [6, 7],
        [7, 8],
        [0, 9],
        [9, 10],
        [10, 11],
        [11, 12],
        [0, 13],
        [13, 14],
        [14, 15],
        [15, 16],
        [0, 17],
        [17, 18],
        [18, 19],
        [19, 20],
        [0, 5],
        [5, 9],
        [9, 13],
        [13, 17],
      ];


      loadResources();


      return () => {
        isMounted = false;

        if (cameraRef.current) {
          try {
            cameraRef.current.stop();
          } catch (e) {
            console.error("Error stopping camera:", e);
          }
        }


        if (tf.getBackend()) {
          try {
            tf.disposeVariables();
          } catch (e) {
            console.error("Error disposing TensorFlow variables:", e);
          }
        }
      };
    }, [retryCount]);


    function isFullHandVisible(handLandmarks) {
      if (!handLandmarks || handLandmarks.length === 0) return false;


      for (const landmarks of handLandmarks) {
        if (landmarks.length !== 21) return false;

        const margin = 0.05;

        const keyPoints = [0, 4, 8, 12, 16, 20];

        for (const idx of keyPoints) {
          const landmark = landmarks[idx];
          if (!landmark) return false;

          if (
            landmark.x < margin ||
            landmark.x > 1 - margin ||
            landmark.y < margin ||
            landmark.y > 1 - margin ||
            landmark.z < -0.5
          ) {
            return false;
          }
        }

        const palmLandmarks = [0, 5, 9, 13, 17];
        for (const idx of palmLandmarks) {
          if (!landmarks[idx]) return false;
        }
      }

      return true;
    }

    const handleRetry = async () => {
      setCameraError(null);
      setIsLoading(true);


      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      if (cameraRef.current) {
        try { cameraRef.current.stop(); } catch(e) {}
      }


      isInitializedRef.current = false;
      setRetryCount(prev => prev + 1);
    };

    return (
      <div className="relative w-full h-full">
        {isLoading && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-neo-bg z-10 border-brutal shadow-brutal-inner">
            <div className="flex flex-col items-center bg-white border-brutal p-6 shadow-brutal">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-neo-blue mb-4 border-l-4 border-l-transparent border-r-4 border-r-transparent shadow-brutal-sm" />
              <p className="text-neo-text font-black tracking-widest uppercase">Memuat Kamera...</p>
            </div>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-neo-bg z-10 border-brutal shadow-brutal-inner p-4">
            <div className="flex flex-col items-center text-center p-6 bg-white border-brutal shadow-brutal max-w-sm w-full">
              <div className="mb-4"><CameraIcon className="w-12 h-12 text-neo-text drop-shadow-[2px_2px_0px_#000]" /></div>
              <p className="text-neo-red font-black uppercase tracking-widest text-xl mb-3 bg-neo-yellow border-brutal px-3 py-1 shadow-brutal-sm -rotate-2">Tidak Tersedia</p>
              <p className="text-neo-text font-bold text-sm mb-6 leading-relaxed">{cameraError}</p>
              <button
                onClick={handleRetry}
                className="w-full py-3 bg-neo-blue hover:bg-blue-400 text-white font-black uppercase tracking-widest transition-all border-brutal shadow-brutal hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ display: "none" }}
        />

        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{
            transform: "scale(-1, 1)",
            objectFit: "cover",
          }}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.active === nextProps.active &&
      prevProps.showDebugInfo === nextProps.showDebugInfo
    );
  }
);

export default HandGestureDetector;
