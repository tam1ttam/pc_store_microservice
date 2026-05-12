import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Hardcoded data for demonstration
const hardcodedUsers = [
    { id: "1", userName: "user1", fullName: "User One", email: "user1@example.com", roles: ["USER"] },
    { id: "2", userName: "manager1", fullName: "Manager One", email: "manager1@example.com", roles: ["MANAGER"] },
    { id: "3", userName: "admin1", fullName: "Admin One", email: "admin1@example.com", roles: ["ADMIN", "USER"] },
    { id: "4", userName: "user2", fullName: "User Two", email: "user2@example.com", roles: ["USER"] },
    { id: "5", userName: "user3", fullName: "User Three", email: "user3@example.com", roles: ["USER"] },
];

const UserManagement: React.FC = () => {
    const { toast } = useToast();
    const [users, setUsers] = useState(hardcodedUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const usersPerPage = 5;

    const handleRoleChange = async (userName: string, role: string) => {
        // Mock API call
        console.log(`Assigning role ${role} to ${userName}`);
        // In a real app, you would call:
        // await adminApi.assignRole(userName, role);

        toast({
            title: "Thành công",
            description: `Đã gán quyền ${role} cho người dùng ${userName}.`,
        });

        // Update local state for demonstration
        setUsers(users.map(u => u.userName === userName ? { ...u, roles: [role] } : u));
    };

    const filteredUsers = users.filter(user =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>
            <div className="flex justify-between items-center mb-4">
                <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên đăng nhập</TableHead>
                            <TableHead>Họ và tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.userName}</TableCell>
                                <TableCell>{user.fullName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.roles.join(", ")}</TableCell>
                                <TableCell className="text-right">
                                    <Select onValueChange={(value) => handleRoleChange(user.userName, value)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Gán quyền" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USER">USER</SelectItem>
                                            <SelectItem value="MANAGER">MANAGER</SelectItem>
                                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-center mt-4">
                <Pagination>
                    <PaginationContent>
                        <PaginationPrevious
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        />
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    href="#"
                                    isActive={i + 1 === currentPage}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationNext
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        />
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
};

export default UserManagement;
