"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentProfile = void 0;
class StudentProfile {
    id;
    userId;
    bio;
    birthDate;
    gender;
    address;
    city;
    skills;
    experiences;
    projects;
    educations;
    certifications;
    cvs;
    constructor(id, userId, bio, birthDate, gender, address, city, skills = [], experiences = [], projects = [], educations = [], certifications = [], cvs = []) {
        this.id = id;
        this.userId = userId;
        this.bio = bio;
        this.birthDate = birthDate;
        this.gender = gender;
        this.address = address;
        this.city = city;
        this.skills = skills;
        this.experiences = experiences;
        this.projects = projects;
        this.educations = educations;
        this.certifications = certifications;
        this.cvs = cvs;
    }
}
exports.StudentProfile = StudentProfile;
//# sourceMappingURL=student-profile.entity.js.map