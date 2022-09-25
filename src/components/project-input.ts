
import { Component } from './base-component'
import { Validatable, validate } from '../utils/validation'
import { projectState } from '../states/project-state'

// Project input class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
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
