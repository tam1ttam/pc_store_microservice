export const CATEGORIES = [
    { keyword: "pc",        name: "PC" },
    { keyword: "laptop",    name: "Laptop" },
    { keyword: "monitor",   name: "Monitor" },
    { keyword: "keyboard",  name: "Keyboard" },
    { keyword: "mouse",     name: "Mouse" },
    { keyword: "headphone", name: "Headphone" },
    { keyword: "ram",       name: "RAM" },
    { keyword: "ssd",       name: "SSD" },
    { keyword: "vga",       name: "VGA" },
    { keyword: "mainboard", name: "Mainboard" },
];

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    laptop:    ["laptop", "notebook", "macbook"],
    pc:        ["pc", "desktop", "may tinh", "case", "bo may"],
    monitor:   ["monitor", "man hinh", "lcd", "display", "screen"],
    keyboard:  ["keyboard", "ban phim", "keycap"],
    mouse:     ["mouse", "chuot"],
    headphone: ["headphone", "headset", "earphone", "tai nghe"],
    ram:       ["ram", "memory", "bo nho"],
    ssd:       ["ssd", "hdd", "hard drive", "o cung"],
    vga:       ["vga", "gpu", "card", "graphics"],
    mainboard: ["mainboard", "motherboard", "bo mach"],
};
