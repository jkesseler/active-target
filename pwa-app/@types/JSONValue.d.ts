type JSONPrimitive = string | number | boolean | null

type JSONValue = JSONPrimitive | JSONObject | JSONArray

interface JSONObject {
  [x: string]: JSONValue
}

type JSONArray = Array<JSONValue>
