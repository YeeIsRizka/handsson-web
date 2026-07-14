import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { HandRaisedIcon, SparklesIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

function TutorialModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cara Bermain"
      footer={
        <Button variant="primary" fullWidth onClick={onClose}>
          Mengerti
        </Button>
      }
    >
      <div className="p-4 sm:p-6 text-neo-text font-bold max-h-[60vh] overflow-y-auto">
        <div className="flex flex-col gap-4 text-left">
          <div className="bg-neo-bg border-brutal p-4 shadow-brutal-sm flex items-start gap-4">
            <div className="bg-white p-2 border-brutal shadow-brutal-sm -rotate-3 mt-1">
              <HandRaisedIcon className="w-6 h-6 text-neo-blue shrink-0" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-wider text-neo-blue">1. Posisi Kamera & Tangan</h3>
              <p className="text-sm mt-1">Posisikan perangkat dan kamera Anda agar tangan terlihat jelas di layar. Fokus menggunakan <span className="font-black">tangan kanan</span>, khususnya saat meragakan isyarat dengan satu tangan.</p>
            </div>
          </div>

          <div className="bg-neo-bg border-brutal p-4 shadow-brutal-sm flex items-start gap-4">
            <div className="bg-white p-2 border-brutal shadow-brutal-sm rotate-3 mt-1">
              <SparklesIcon className="w-6 h-6 text-neo-red shrink-0" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-wider text-neo-red">2. Bentuk Isyarat</h3>
              <p className="text-sm mt-1">Saat permainan dimulai, Anda akan melihat huruf petunjuk. Bentuklah tangan Anda sesuai dengan isyarat <span className="font-black">BISINDO</span> dari huruf tersebut.</p>
            </div>
          </div>

          <div className="bg-neo-bg border-brutal p-4 shadow-brutal-sm flex items-start gap-4">
            <div className="bg-white p-2 border-brutal shadow-brutal-sm -rotate-3 mt-1">
              <CheckCircleIcon className="w-6 h-6 text-neo-green shrink-0" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-wider text-neo-green">3. Tahan Posisi</h3>
              <p className="text-sm mt-1">Setelah tangan Anda membentuk isyarat yang benar, <span className="font-black">tahan posisi tersebut</span> beberapa saat hingga bar deteksi penuh dan berwarna hijau.</p>
            </div>
          </div>

          <div className="bg-neo-bg border-brutal p-4 shadow-brutal-sm flex items-start gap-4">
            <div className="bg-white p-2 border-brutal shadow-brutal-sm rotate-3 mt-1">
              <ClockIcon className="w-6 h-6 text-neo-purple shrink-0" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-wider text-neo-purple">4. Selesaikan Kata</h3>
              <p className="text-sm mt-1">Rangkai huruf demi huruf dengan tepat menjadi sebuah kata. Ingat, setiap mode memiliki tantangan dan objektif yang berbeda-beda. Ayo mulai!</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default TutorialModal;
