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

// Project list class
class ProjectList {
    templateElement: HTMLTemplateElement;
    // Element where we will render our template
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: any[];

    constructor(private type: 'active' | 'finished'){
        //<> and as is type casting
        this.templateElement = <HTMLTemplateElement> document.getElementById('project-list')!;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        this.assignedProjects = [];
    
        // Render the template
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        projectState.addListener((projects: any[]) => {
            this.assignedProjects = projects;
            this.renderProjects();
        });
        
        this.attach();
        this.renderContext();
    }

    private renderProjects(){
        const listElement = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        for (const projectItem of this.assignedProjects){
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listElement.appendChild(listItem);
        } 

    }

    private renderContext(){
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    // Attach the element to the DOM
    private attach(){
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }

} 

// Project input class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    // Element where we will render our template
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        //<> and as is type casting
        this.templateElement = <HTMLTemplateElement> document.getElementById('project-input')!;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
    
        // Render the template
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        // Add id 'user-input' to the form element (for css)
        this.element.id = 'user-input';
        // Acess to the inputs
        this.titleInputElement =<HTMLInputElement> this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.attach();
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

    // Add event listener
    // TODO fix @autobind
    private configure() {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

// Global state management class
class ProjectState{
    private listeners: any[] = [];
    private projects: any[] = [];
    private static instance: ProjectState;

    //Guarantee that tis is a singleton class
    constructor(){}

    // TODO check if this is working fine
    static getInstance() {
        return this.instance || (this.instance = new ProjectState());
    }

    addListener(listenerFn: Function){
        this.listeners.push(listenerFn);
    }

    addProject(title: String, description: String, numOfPeople: number){
        const newProject = {
            id: Math.random().toString(),
            title,
            description,
            people: numOfPeople      
        }
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

const printInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');