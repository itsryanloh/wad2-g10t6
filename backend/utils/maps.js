// @ts-check
import assert from "node:assert"
import fs from "node:fs/promises"
import inside from "point-in-polygon-hao"

/** @typedef {[number, number, 0] | [number, number]} LatLng */
/** @typedef {LatLng[][]} PolygonBounds */

class AbstractBounds {
  /**
   * @param {LatLng} _coord
   * @returns {boolean}
   */
  inBoundary(_coord) {
    throw new Error("Not implemented")
  }
}

class Polygon extends AbstractBounds {
  /**
   * @param {PolygonBounds} coords 
   */
  constructor(coords) {
    super()
    this.coords = coords
  }

  /**
   * @override
   * @param {LatLng} coord
   * @returns {boolean}
   */
  inBoundary(coord) {
    return !!inside(coord, this.coords)
  }
}

class MultiPolygon extends AbstractBounds {
  /**
   * @param {PolygonBounds[]} polys
   */
  constructor(polys) {
    super()
    this.polys = polys.map(bounds => new Polygon(bounds))
  }

  /**
   * @override
   * @param {LatLng} coord
   * @returns {boolean}
   */
  inBoundary(coord) {
    return this.polys.some(poly => poly.inBoundary(coord))
  }
}

import { env } from "node:process"
const { ONEMAP_API_KEY } = env

console.log(ONEMAP_API_KEY ? "Fetching data from onemap..." : "ONEMAP_API_KEY not found, reading data from file")

/**
 * @type {Promise<[AbstractBounds, string][]>}
 */

// for offline mode download from https://data.gov.sg/datasets/d_4765db0e87b9c86336792efe8a1f7a66/view

const polygons = (
  ONEMAP_API_KEY
    ? fetch("https://www.onemap.gov.sg/api/public/popapi/getAllPlanningarea", { headers: { Authorization: ONEMAP_API_KEY } }).then(obj => obj.json()).then(({ SearchResults }) => SearchResults.map(({ geojson, pln_area_n }) => {
      const { type, coordinates } = JSON.parse(geojson);
      return [polygonFactory(type, coordinates), pln_area_n]
    }))
    : fs.readFile("./MasterPlan2019PlanningAreaBoundaryNoSea.geojson", { encoding: "ascii" }).then(JSON.parse).then(({ features }) => features)
      .then(arr => arr.map(
        ({ properties: { Description }, geometry: { type, coordinates } }) => [polygonFactory(type, coordinates), Description.match(/<td>([^<]*)<\/td>/)[1]]))
)
  .then(
    obj => {
      console.log("Data loaded successfully")
      return obj
    }
  )

/**
 * @param {LatLng} coords
 * @returns {Promise<string | undefined>}
 */
export async function findAreaName(coords) {
  return polygons.then(arr => arr.find(([poly]) => poly.inBoundary(coords))?.[1])
}

/**
 * @param {"Polygon" | "MultiPolygon"} type 
 * @param {any} coordinates 
 * @returns {AbstractBounds}
 */
function polygonFactory(type, coordinates) {
  if (type === "Polygon") return new Polygon(coordinates)
  if (type === "MultiPolygon") return new MultiPolygon(coordinates)
  throw new Error("Unknown feature type")
}
