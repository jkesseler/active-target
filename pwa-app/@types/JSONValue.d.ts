type JSONPrimitive = string | number | boolean | null;

interface JSONObject {
    [x: string]: JSONValue;
}

type JSONArray = Array<JSONValue>

type JSONValue = JSONPrimitive | JSONObject | JSONArray;
