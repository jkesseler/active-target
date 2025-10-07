type ValueOf<Obj> = Obj[keyof Obj]
type OneOnly<Obj, Key extends keyof Obj> = { [key in Exclude<keyof Obj, Key>]+?: undefined } & Pick<Obj, Key>
type OneOfByKey<Obj> = { [key in keyof Obj]: OneOnly<Obj, key> }
type OneOfType<Obj> = ValueOf<OneOfByKey<Obj>>

/*
// Example usage
type AorBorC = OneOfType<{
  a: string;
  b: string;
  c: string;
}>;

// This now works!
const a: AorBorC = {
  a: "a",
  b: undefined,
};

*/
