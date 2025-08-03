// public/js/speech.js

const synth = window.speechSynthesis;
let voices = [];

// Tải danh sách giọng đọc (thường là bất đồng bộ)
function loadVoices() {
    voices = synth.getVoices();
    if (voices.length === 0) {
        synth.onvoiceschanged = () => {
            voices = synth.getVoices();
        };
    }
}

// Gọi hàm này ngay khi module được tải
loadVoices();

/**
 * Phát âm một đoạn văn bản
 * @param {string} text - Đoạn văn bản cần đọc
 * @param {string} lang - Mã ngôn ngữ (ví dụ: 'en-US', 'vi-VN')
 */
export function speak(text, lang = 'en-US') {
    if (!synth || !text) {
        console.warn("Speech Synthesis không được hỗ trợ hoặc không có văn bản để đọc.");
        return;
    }

    // Hủy bỏ bất kỳ phát âm nào đang diễn ra
    if (synth.speaking) {
        synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onend = () => {
        // console.log("Phát âm hoàn tất.");
    };

    utterance.onerror = (event) => {
        console.error("Lỗi phát âm:", event.error);
    };

    // Chọn giọng đọc phù hợp
    let selectedVoice = voices.find(voice => voice.lang === lang && voice.name.includes('Google'));
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang === lang);
    }
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    } else {
        utterance.lang = lang; // Dự phòng nếu không tìm thấy giọng
    }

    // Điều chỉnh các thông số
    utterance.pitch = 1; // 0 đến 2
    utterance.rate = 0.9;  // 0.1 đến 10
    utterance.volume = 1; // 0 đến 1

    synth.speak(utterance);
}