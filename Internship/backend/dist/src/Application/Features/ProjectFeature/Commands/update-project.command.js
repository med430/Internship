"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectCommand = void 0;
class UpdateProjectCommand {
    userId;
    id;
    title;
    description;
    technologies;
    githubUrl;
    demoUrl;
    constructor(userId, id, title, description, technologies, githubUrl, demoUrl) {
        this.userId = userId;
        this.id = id;
        this.title = title;
        this.description = description;
        this.technologies = technologies;
        this.githubUrl = githubUrl;
        this.demoUrl = demoUrl;
    }
}
exports.UpdateProjectCommand = UpdateProjectCommand;
//# sourceMappingURL=update-project.command.js.map