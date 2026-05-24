"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProjectCommand = void 0;
class CreateProjectCommand {
    userId;
    title;
    description;
    technologies;
    githubUrl;
    demoUrl;
    constructor(userId, title, description, technologies, githubUrl, demoUrl) {
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.technologies = technologies;
        this.githubUrl = githubUrl;
        this.demoUrl = demoUrl;
    }
}
exports.CreateProjectCommand = CreateProjectCommand;
//# sourceMappingURL=create-project.command.js.map