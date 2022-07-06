import { Project, ProjectStatus } from '../models/project.js'

// T generic type
type Listener<T> = (items: T[]) => void;

class State<T> {
    // protected is only acesible by the children
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>){
        this.listeners.push(listenerFn);        
    }
}

// Global state management class
export class ProjectState extends State<Project>{
    private projects: Project[] = [];
    private static instance: ProjectState;

    //Guarantee that tis is a singleton class
    constructor(){
        super();
    }

    // TODO check if this is working fine
    static getInstance() {
        return this.instance || (this.instance = new ProjectState());
    }

    addProject(title: string, description: string, numOfPeople: number){
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus){
        const project = this.projects.find(prj => prj.id === projectId)
        if (project && project.status !== newStatus){
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners(){
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

export const projectState = ProjectState.getInstance();




