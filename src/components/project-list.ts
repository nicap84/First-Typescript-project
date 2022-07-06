
import { Component } from './base-component.js'
import { ProjectItem } from './project-item.js'
import { DragTarget } from '../models/drag-drop.js'
import { Project, ProjectStatus } from '../models/project.js'
import { projectState } from '../states/project-state.js'


// Project list class
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished'){
        // Component constructor
        super('project-list', 'app', true, `${type}-projects`)
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer?.types[0] === 'text/plain') {
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
    }

    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    dragLeaveHandler(_: DragEvent): void {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
    }

    renderContent(): void {
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    configure(): void{
        this.element.addEventListener('dragover', this.dragOverHandler.bind(this));
        this.element.addEventListener('drop', this.dropHandler.bind(this));
        this.element.addEventListener('dragleave', this.dragLeaveHandler.bind(this));

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(project => {
                return (this.type === 'active') ? (project.status === ProjectStatus.Active) : (project.status === ProjectStatus.Finished);
            })
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }

    private renderProjects(){
        const listElement = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        listElement.innerHTML = '';
        for (const projectItem of this.assignedProjects){
            new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
        } 
    }
}
