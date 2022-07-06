// Base class to render properies
export abstract class Component <T extends HTMLElement, U extends HTMLElement> {
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