"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
class Project {
    id;
    studentProfileId;
    title;
    description;
    technologies;
    githubUrl;
    demoUrl;
    constructor(id, studentProfileId, title, description, technologies, githubUrl, demoUrl) {
        this.id = id;
        this.studentProfileId = studentProfileId;
        this.title = title;
        this.description = description;
        this.technologies = technologies;
        this.githubUrl = githubUrl;
        this.demoUrl = demoUrl;
    }
}
exports.Project = Project;
//# sourceMappingURL=project.entity.js.map