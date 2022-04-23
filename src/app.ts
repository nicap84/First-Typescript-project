//Validation
interface Validatable {
    value: string | number;
    required: boolean;
    // ? is to say that this param is optional
    minLength?: number;  
    maxLength?: number;
    min?: number;
    max?: number;
} 

function validate(validatableInput: Validatable): boolean{
    let isValid = true;
    if (validatableInput.required){
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null && typeof validatableInput.value == 'string'){
        isValid= isValid && validatableInput.value.length > validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value == 'string'){
        isValid= isValid && validatableInput.value.length > validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value == 'number'){
        isValid= isValid && validatableInput.value > validatableInput.min;
    }
    if (validatableInput.max != null && typeof validatableInput.value == 'number'){
        isValid= isValid && validatableInput.value > validatableInput.max;
    }
    return isValid;
}

// Autobin decorator
function autobind(
    _: any,
    _2: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
      configurable: true,
      get() {
        const boundFn = originalMethod.bind(this);
        return boundFn;
      }
    };
    console.log(adjDescriptor);
    return adjDescriptor;
  }

  // Base class to render properies
abstract class Component <T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    // ? in newElementId means optional
    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string,) {
        this.templateElement = <HTMLTemplateElement> document.getElementById(templateId)!;
        this.hostElement = document.getElementById(hostElementId)! as T;

        // Render the template
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if (newElementId){
            this.element.id = `${newElementId}-projects`;
        } 

        this.attach(insertAtStart);
    }

    private attach(insertAtStart: boolean){
        this.hostElement.insertAdjacentElement(insertAtStart?'beforeend': 'afterbegin', this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

// Project list class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished'){
        // Component constructor
        super('project-list', 'app', true, `${type}-projects`)
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    renderContent(): void {
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    configure(): void{
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(project => {
                return (this.type === 'active') ? (project.status === ProjectStatus.Active) : (project.status === ProjectStatus.Finished);
            })
            //this.assignedProjects = projects;
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

// Project input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', `app`, true,  `user-input`)

        this.titleInputElement =<HTMLInputElement> this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
    }

    // Add event listener
    // TODO fix @autobind
    // It's covention have public methods first
    configure(): void {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }

    renderContent(): void {
    }

    //tupla
    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable : Validatable = {
            value: enteredTitle,
            required: true,
        }

        const descriptionValidatable : Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }

        const peopleValidatable : Validatable = {
            value: enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        //validation
        if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)){
        //if (enteredTitle.trim().length === 0 || enteredDescription.trim().length === 0 || enteredPeople.trim().length === 0){
            alert('There is some input empty');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    // Event steps
    private submitHandler(event: Event) {
        event.preventDefault();
        console.log('submitHandler', this.titleInputElement.value);

        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)){
            const [title, description, people] = userInput;
            console.log (title, description, people);
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }

}

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
class ProjectState extends State<Project>{
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
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

enum ProjectStatus { Active, Finished };

class Project {
    constructor (public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus){}
}

// Project Item class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {

    private project: Project;

    constructor(hostId: string, project: Project){
        super('single-project', hostId, false, project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    configure(): void {}

    renderContent(): void {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.project.people.toString();
        this.element.querySelector('p')!.textContent = this.project.description ;
    }

}

const projectState = ProjectState.getInstance();

const printInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');