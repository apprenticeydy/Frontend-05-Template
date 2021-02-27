//let element = document.documentElement;
let contexts = new Map();
let isListeningMouse = false;

export class Dispatcher {
    constructor(element) {
        this.element = element;
    }
    dispatch(type, properties) {
        let event = new Event(type);
        for (const name in properties) {
            event[name] = properties[name];
        }
        this.element.dispatchEvent(event);
    }
}


export class Listener {
    constructor(element, Recognizer) {
        element.addEventListener("mousedown", (event) => {
            let context = Object.create(null);
            contexts.set("mouse" + (1 << event.button), context);
            Recognizer.start(event, context);

            let mousemove = (event) => {
                let button = 1;

                while (button <= event.buttons) {
                    if (button & event.buttons) {
                        let key = button;
                        if (button === 2) {
                            key = 4;
                        } else if (button === 4) {
                            key = 2;
                        }
                        let context = contexts.get("mouse" + key);
                        Recognizer.move(event, context);
                    }
                    button = button << 1;
                }
            };

            let mouseup = (event) => {
                let context = contexts.get("mouse" + (1 << event.button));
                Recognizer.end(event, context);
                contexts.delete("mouse" + (1 << event.button));
                if (event.buttons === 0) {
                    document.removeEventListener("mousemove", mousemove);
                    document.removeEventListener("mouseup", mouseup);
                    isListeningMouse = false;
                }
            };
            if (!isListeningMouse) {
                document.addEventListener("mousemove", mousemove);
                document.addEventListener("mouseup", mouseup);
                isListeningMouse = true;
            }
        });


        document.addEventListener("touchstart", (event) => {
            for (const touch of event.changedTouches) {
                let context = Object.create(null);
                contexts.set(touch.identifier, context);
                Recognizer.start(touch, context);
            }
        });
        document.addEventListener("touchmove", (event) => {
            for (const touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                Recognizer.move(touch, context);
            }
        });
        document.addEventListener("touchend", (event) => {
            for (const touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                Recognizer.end(touch, context);
                contexts.delete(touch.identifier);
            }
        });
        document.addEventListener("touchcancel", (event) => {
            for (const touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                Recognizer.cancel(touch, context);
                contexts.delete(touch.identifier);
            }
        });

    }
}

export class Recognizer {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }

    start(point, context) {
        context.isPress = false;
        context.isPan = false;
        context.isTap = true;

        (context.startX = point.clientX), (context.startY = point.clientY);

        this.dispatcher.dispatch("start", {
            clientX: point.clientX,
            clientY: point.clientY
        })
        context.points = [{
            t: Date.now(),
            x: point.clientX,
            y: point.clientY,
        }, ];

        context.handler = setTimeout(() => {
            this.dispatcher.dispatch("press", {});
            context.isPress = true;
            context.isPan = false;
            context.isTap = false;
            context.handler = null;
        }, 500);
    }

    move(point, context) {
        
        let dx = point.clientX - context.startX,
            dy = point.clientY - context.startY;
        context.isVertical = Math.abs(dx) < Math.abs(dy);
        if (!context.isPan && dx ** 2 + dy ** 2 > 100) {
            context.isPan = true;
            context.isPress = false;
            context.isTap = false;
            this.dispatcher.dispatch("panstart", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
            });
            clearTimeout(context.handler);
        }
        if (context.isPan) {
            this.dispatcher.dispatch("pan", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
            });
        }

        context.points = context.points.filter(
            (point) => Date.now() - point.t <= 500
        );
        context.points.push({
            t: Date.now(),
            x: point.clientY,
            y: point.clientY
        });
    }

    end(point, context) {
        let v;
        if (!context.points.length) {
            v = 0;
        } else {
            v =
                Math.sqrt(
                    (point.clientX - context.points[0].x) ** 2 +
                    (point.clientY - context.points[0].y) ** 2
                ) /
                (Date.now() - context.points[0].t);
        }
        if (v >= 1.5) {
            context.isFlick = true;
            this.dispatcher.dispatch("flick", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick,
                velocity: v,
            });
        } else {context.isFlick = false;}

        if (context.isTap) {
            this.dispatcher.dispatch("tap", {});
            clearTimeout(context.handler);
        }
        if (context.isPress) {
            this.dispatcher.dispatch("pressend", {});
        }
        if (context.isPan) {
            this.dispatcher.dispatch("panend", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick,
                velocity: v
            });
        }
        this.dispatcher.dispatch("end", {
            startX: context.startX,
            startY: context.startY,
            clientX: point.clientX,
            clientY: point.clientY,
            isVertical: context.isVertical,
            isFlick: context.isFlick,
            velocity: v
        });
    }

    cancel(point, context) {
        clearTimeout(context.handler);
        this.dispatcher.dispatch("cancel", {});
    }
}

export function enableGesture(element) {
    return new Listener(element, new Recognizer(new Dispatcher(element)));
}