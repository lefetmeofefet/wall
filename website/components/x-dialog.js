import {html, createYoffeeElement, YoffeeElement} from "../libs/yoffee/yoffee.min.js"


createYoffeeElement("x-dialog", class extends YoffeeElement {
    constructor() {
        super({
            open: false,
        })

        // document.addEventListener(
        //     "click",
        //     e => {
        //         if (!this.contains(e.target) && this.state.open) {
        //             this.close()
        //         }
        //     },
        //     {
        //         capture: false
        //     }
        // )
    }

    render() {
        return html(this.state)`
${() => this.state.open && html(this.state)`
<style>
    :host {
        position: fixed;
        top: ${() => this.state.position.y}px;
        left: ${() => this.state.position.x}px;
        display: flex;
        flex-direction: column;
        z-index: 1;
        background-color: #222222;
        border-radius: 4px;
        box-shadow: 1px 1px 5px 0px #000000c2;
        color: #bbbbbb;
    }
    
</style>
<slot
    onclick=${() => e => {
            e.stopPropagation();
            e.preventDefault()
        }}
    onmousedown=${() => e => {
            e.stopPropagation();
            e.preventDefault()
        }}
    onhover=${() => e => {
            e.stopPropagation();
            e.preventDefault()
        }}
    onmouseover=${() => e => {
            e.stopPropagation();
            e.preventDefault()
        }}
    onmousein=${() => e => {
            e.stopPropagation();
            e.preventDefault()
        }}
></slot>
`}
            `
    }

    open(anchor, shouldPopIntoScreen, margin) {
        if (anchor === "center") {
            this.state.position = {
                x: window.innerWidth / 2 - 150,
                y: window.innerHeight / 2 - 50,
            }
        } else {
            this.state.position = anchor.x != null ?
                {
                    x: anchor.x,
                    y: anchor.y
                } : {
                    x: anchor.offsetLeft,
                    y: anchor.offsetTop
                };
        }



        this.state.open = true;

        if (shouldPopIntoScreen) {
            let {width, height} = this.getBoundingClientRect();
            margin = margin || 20;

            if (this.state.position.x + width + margin > window.innerWidth) {
                this.state.position.x = window.innerWidth - width - margin;
            }
            if (this.state.position.x < margin) {
                this.state.position.x = margin;
            }

            if (this.state.position.y + height + margin > window.innerHeight) {
                this.state.position.y = window.innerHeight - height - margin;
            }
            if (this.state.position.y < margin) {
                this.state.position.y = margin;
            }

            // IMPROTANT
            this.state.position = this.state.position;
        }
    }

    close() {
        this.state.open = false;
    }
});