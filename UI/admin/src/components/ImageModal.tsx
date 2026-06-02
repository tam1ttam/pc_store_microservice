import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    alt: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, alt }: Props) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={onClose}
        >
            <div className="relative ">
                <button 
                    onClick={onClose}
                    className="absolute -top-4 -right-4 p-2 bg-white rounded-full hover:bg-gray-100 shadow-lg"
                >
                    <X className="w-4 h-4" />
                </button>
                <img 
                    src={imageUrl} 
                    alt={alt}
                    className="   object-contain" style={{width:"700px"}}
                />
            </div>
        </div>
    );
}
