export const CATEGORIES = [
    { name: "PC" },
    { name: "Monitor" },
    { name: "Keyboard" },
    { name: "Mouse" },
    { name: "Headphone" },
    { name: "RAM" },
    { name: "SSD" },
    { name: "VGA" },
    { name: "Mainboard" }
];

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    Laptop: ["laptop", "notebook", "macbook"],
    PC: ["pc", "desktop", "may tinh", "case", "bo may"],
    Monitor: ["monitor", "man hinh", "lcd", "display", "screen"],
    Keyboard: ["keyboard", "ban phim", "keycap"],
    Mouse: ["mouse", "chuot"],
    Headphone: ["headphone", "headset", "earphone", "tai nghe"],
    Chair: ["chair", "ghe"],
    RAM: ["ram", "memory", "bo nho"],
    SSD: ["ssd", "hdd", "hard drive", "o cung"],
    VGA: ["vga", "gpu", "card", "graphics"],
    Mainboard: ["mainboard", "motherboard", "bo mach"]
};
