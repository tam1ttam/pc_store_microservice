import { About_PC_1, About_PC_2, About_PC_3, About_Video, User1, User2, User3 } from "@/assets/about";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Building2, Users2, Wrench } from "lucide-react";

export default function About() {
    const imgs = [User1, User2, User3];
    return (
        <div className="flex-1 overflow-hidden">
            {/* Hero Section */}
            <section className="relative h-[80vh] bg-gradient-to-b from-black to-gray-900 rounded-t-[2rem] overflow-hidden">
                <div className="absolute inset-0">
                    <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover brightness-50 ">
                        <source src={About_Video} type="video/mp4" />
                    </video>
                </div>
                <div className="container relative mx-auto px-4 h-full flex items-center">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-6xl md:text-7xl font-bold mb-8 animate-fade-up text-white">
                            Chúng Tôi Là{" "}
                            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 text-transparent bg-clip-text">
                                Chuyên Gia PC Gaming
                            </span>
                        </h1>
                        <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
                            Với hơn 10 năm kinh nghiệm, chúng tôi tự hào là đơn vị tiên phong trong lĩnh vực PC Gaming
                            cao cấp tại Việt Nam
                        </p>
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-32 bg-gradient-to-b from-gray-900 to-black px-10">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 bg-clip-text text-transparent">
                                Tầm Nhìn & Sứ Mệnh
                            </h2>
                            <p className="text-xl text-gray-300 leading-relaxed">
                                Chúng tôi không chỉ đơn thuần là nơi bán PC Gaming, mà còn là người đồng hành đáng tin
                                cậy trong hành trình nâng tầm trải nghiệm gaming của bạn.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                {stats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm border border-gray-700/30"
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                                            <stat.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <p className="text-5xl font-bold text-transparent bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text mb-3">
                                            {stat.value}
                                        </p>
                                        <p className="text-gray-300 text-lg">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-12 gap-4 h-[600px]">
                            <div className="col-span-8 row-span-2">
                                <img
                                    src={About_PC_3}
                                    alt="PC Gaming"
                                    className="w-full h-full object-cover rounded-3xl shadow-2xl hover:scale-[1.02] transition-all duration-500"
                                />
                            </div>
                            <div className="col-span-4">
                                <img
                                    src={About_PC_2}
                                    alt="PC Setup"
                                    className="w-full h-full object-cover rounded-3xl shadow-2xl hover:scale-[1.02] transition-all duration-500"
                                />
                            </div>
                            <div className="col-span-4">
                                <img
                                    src={About_PC_1}
                                    alt="Gaming Setup"
                                    className="w-full h-full object-cover rounded-3xl shadow-2xl hover:scale-[1.02] transition-all duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-32 bg-gradient-to-b from-black to-gray-900 px-10">
                <div className="container mx-auto px-4">
                    <h2 className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 bg-clip-text text-transparent pb-10">
                        Đội Ngũ Chuyên Nghiệp
                    </h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        {team.map((member, index) => (
                            <div key={member.name} className="group">
                                <div className="relative p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-3xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-700/30">
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                        <img
                                            src={imgs[index]}
                                            alt={member.name}
                                            className="w-24 h-24 rounded-full border-4 border-gray-800 object-cover group-hover:scale-110 transition-all duration-500"
                                        />
                                    </div>
                                    <div className="mt-14">
                                        <h3 className="text-2xl font-bold text-white text-center mb-2">
                                            {member.name}
                                        </h3>
                                        <p className="text-orange-500 text-center mb-6 font-medium">{member.role}</p>
                                        <p className="text-gray-400 text-center leading-relaxed">
                                            {member.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 rounded-b-[2rem] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587202372161-587a58c7c7d9')] opacity-20 bg-cover bg-center"></div>
                <div className="container relative mx-auto px-4 text-center">
                    <h2 className="text-5xl font-bold text-white mb-8">Hãy Để Chúng Tôi Đồng Hành Cùng Bạn</h2>
                    <p className="text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
                        Khám phá ngay các giải pháp PC Gaming tối ưu từ đội ngũ chuyên gia của chúng tôi
                    </p>
                    <Button
                        size="lg"
                        className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-7 rounded-full text-xl font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                    >
                        Liên Hệ Ngay
                        <ArrowRight className="ml-2 w-6 h-6" />
                    </Button>
                </div>
            </section>
        </div>
    );
}

const stats = [
    {
        value: "10+",
        label: "Năm Kinh Nghiệm",
        icon: Building2
    },
    {
        value: "50+",
        label: "Chuyên Gia",
        icon: Users2
    },
    {
        value: "1000+",
        label: "Dự Án Hoàn Thành",
        icon: Award
    },
    {
        value: "24/7",
        label: "Hỗ Trợ Kỹ Thuật",
        icon: Wrench
    }
];

const team = [
    {
        name: "Trần Đức Vũ",
        role: "Giám Đốc Kỹ Thuật",
        description: "15 năm kinh nghiệm trong lĩnh vực PC Gaming cao cấp, chuyên gia tư vấn giải pháp gaming đỉnh cao",
        img: ""
    },
    {
        name: "Mai Chí Tâm",
        role: "Trưởng Phòng Thiết Kế",
        description: "Chuyên gia về thiết kế và tối ưu hóa hệ thống, 10 năm kinh nghiệm trong ngành công nghiệp gaming"
    },
    {
        name: "Nam Trung - Văn Phong",
        role: "Trưởng Phòng CSKH",
        description:
            "10 năm kinh nghiệm trong lĩnh vực chăm sóc khách hàng, luôn đặt sự hài lòng của khách hàng lên hàng đầu"
    }
];
