import {Component,STATE,ATTRIBUTE} from "./framework.js";
import {enableGesture} from "./gesture.js"
import {Timeline,Animation} from "./animation.js"
import {ease} from "./ease.js"

export {STATE, ATTRIBUTE} from "./framework.js";

export class Carousel extends Component {
  constructor() {
    super();
  }

  render() {
    this.root = document.createElement("div");
    this.root.classList.add("carousel");
    for (const record of this[ATTRIBUTE].src) {
      let child = document.createElement("div");
      child.style.backgroundImage = `url('${record.img}')`;
      this.root.appendChild(child);
    }

    enableGesture(this.root);
    let timeline = new Timeline();
    timeline.start();
    let handler = null;

    let children = this.root.children;

    this[STATE].position = 0;

    let t = 0;

    let ax = 0;

    this.root.addEventListener("start", event => {
      timeline.pause();
      clearInterval(handler);
      if(Date.now()-t<500) {
        let progress = (Date.now() - t) / 500;
        ax = ease(progress) * 571 -571;
      } else {
        ax = 0;
      }
    });

    this.root.addEventListener("tap", event => {
      this.triggerEvent("click", {
        position:this[STATE].position,
        data:this[ATTRIBUTE].src[this[STATE].position]
      })
    });

    this.root.addEventListener("pan", event => {
      let x = event.clientX - event.startX - ax;
      let current = this[STATE].position - ((x - x % 571) / 571);
      for (const offset of [-1, 0, 1]) {
        let pos = current + offset;
        pos = (pos % children.length + children.length) % children.length;

        children[pos].style.transition = "none";
        children[pos].style.transform = `translateX(${- pos * 571 + offset * 571 + x % 571}px)`;
      }
    });

    this.root.addEventListener("end", event => {

      timeline.reset();
      timeline.start();
      handler = setInterval(nextPicture, 3000);

      let x = event.clientX - event.startX - ax;
      let current = this[STATE].position - ((x - x % 571) / 571);

      let direction = Math.round((x % 571) / 571);

      if(event.isFlick) {
        if(event.velocity < 0) {
          direction = Math.ceil((x%571)/571)
        } else {
          direction = Math.floor((x%571)/571)
        }
      }


      for (const offset of [-1, 0, 1]) {
        let pos = current + offset;
        pos = (pos % children.length + children.length) % children.length;
        children[pos].style.transition = "none";
        timeline.add(new Animation(children[pos].style, "transform",
        - pos * 571 + offset * 571 + x % 571, 
        - pos * 571 + offset * 571 + direction * 571, 
        500, ease, 0, v => {return `translateX(${v}px)`}));

        this[STATE].position = this[STATE].position - ((x - x % 571) / 571) - direction;
        this[STATE].position = (this[STATE].position % children.length + children.length) % children.length
        this.triggerEvent("Change",{position: this[STATE].position});
      }
    });

    let nextPicture = () => {
      let children = this.root.children;
      let current = children[this[STATE].position];
      let nextPosition = (this[STATE].position + 1) % children.length;
      let next = children[nextPosition];

      t = Date.now();

      timeline.add(new Animation(current.style, "transform",
        -this[STATE].position * 571, -571 - this[STATE].position * 571, 500, ease, 0, v => {return `translateX(${v}px)`}));
      timeline.add(new Animation(next.style, "transform",
        571 - nextPosition * 571, -nextPosition * 571, 500, ease, 0, v => {return `translateX(${v}px)`}));
     
      this[STATE].position = nextPosition;
      this.triggerEvent("change",{position: this[STATE].position});
    }

    handler = setInterval(nextPicture, 3000);

    return this.root;
  }

}