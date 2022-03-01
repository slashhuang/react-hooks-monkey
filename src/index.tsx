/**
 * @desc react hooks monkey patch
 * @refence https://www.netlify.com/blog/2019/03/11/deep-dive-how-do-react-hooks-really-work/
 */
 export {}
 type IFiber = {
  next?: IFiber,
  value?: any;
}
/**
 * @desc react fiber部分的模拟
 */
const MyReact = (() => {
  const fiberNode: IFiber = {
  };
  let fiberLinkNode: IFiber = fiberNode;
  let nextFiberLinkNode: IFiber = fiberLinkNode;
  let compInst: any;
  // {} => {next} => {next: next}
  const composeNext = (val: any) => {
    if (!nextFiberLinkNode.value) {
      nextFiberLinkNode.value = val;
    }
    if (!nextFiberLinkNode.next) {
      nextFiberLinkNode.next = {}
    }
    nextFiberLinkNode = nextFiberLinkNode.next;
  }
  const singletonInst = (Component: any) => {
    if (!compInst) {
      compInst = Component;
    }
    return compInst;
  }
  const mutationInside = {
    useState<T>(value: T) {
      const tmpNext = nextFiberLinkNode;
      const setValue = (nextValue: T) => {
        tmpNext.value = nextValue;
        mutationInside.render(compInst);
      }
      composeNext(value);
      return [tmpNext.value || value, setValue];
    },
    useEffect(fn: any, depArray: Array<any>) {
      const deps = fiberLinkNode.value;
      const hasChangedDeps = deps ? !depArray.every((el: any, i: number) => el === deps[i]) : true
      composeNext(depArray);
      if (hasChangedDeps) {
        fn();
      }
    },
    render(Component: any) {
      const compInst = singletonInst(Component)();
      compInst.render()
      // start from scratch
      nextFiberLinkNode = fiberLinkNode;
      return compInst
    },
  }
  return mutationInside;
})();
/**
 * @demo test
 * @returns
 */
function Counter() {
  const [count, setCount] = MyReact.useState(0)
  const [text, setText] = MyReact.useState('foo') // 2nd state hook!
  MyReact.useEffect(() => {
    console.log('effect', count, text)
  }, [count, text])
  return {
    click: () => setCount(count + 1),
    type: (txt: string) => setText(txt),
    noop: () => setCount(count),
    render: () => console.log('render', { count, text })
  }
}

const inst = MyReact.render(Counter);
inst.click();
inst.type('lalala');