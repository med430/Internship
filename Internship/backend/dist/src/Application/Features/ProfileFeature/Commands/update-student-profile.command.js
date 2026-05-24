"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStudentProfileCommand = void 0;
class UpdateStudentProfileCommand {
    userId;
    name;
    lastname;
    username;
    phone;
    avatarUrl;
    bio;
    birthDate;
    gender;
    address;
    city;
    constructor(userId, name, lastname, username, phone, avatarUrl, bio, birthDate, gender, address, city) {
        this.userId = userId;
        this.name = name;
        this.lastname = lastname;
        this.username = username;
        this.phone = phone;
        this.avatarUrl = avatarUrl;
        this.bio = bio;
        this.birthDate = birthDate;
        this.gender = gender;
        this.address = address;
        this.city = city;
    }
}
exports.UpdateStudentProfileCommand = UpdateStudentProfileCommand;
//# sourceMappingURL=update-student-profile.command.js.map