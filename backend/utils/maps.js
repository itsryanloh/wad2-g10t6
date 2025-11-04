// @ts-check
import inside from "point-in-polygon-hao"

/** @typedef {[number, number, 0] | [number, number]} LngLat */
/** @typedef {LngLat[][]} PolygonBounds */

class AbstractBounds {
  /**
   * @param {LngLat} _coord
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
   * @param {LngLat} coord
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
   * @param {LngLat} coord
   * @returns {boolean}
   */
  inBoundary(coord) {
    return this.polys.some(poly => poly.inBoundary(coord))
  }
}

import { env } from "node:process"
import { getCommunityIdByAreaName } from "./communities.js"
const { ONEMAP_EMAIL, ONEMAP_PASSWORD } = env

const ONEMAP_API_KEY = await fetch("https://www.onemap.gov.sg/api/auth/post/getToken", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: ONEMAP_EMAIL,
    password: ONEMAP_PASSWORD
  })
})
  .then(data => data.json())
  .then(({ access_token }) => access_token)

console.log("Fetching data from onemap...")

// for offline mode download from https://data.gov.sg/datasets/d_4765db0e87b9c86336792efe8a1f7a66/view
// fs.readFile("./MasterPlan2019PlanningAreaBoundaryNoSea.geojson", { encoding: "ascii" }).then(JSON.parse).then(({ features }) => features)
//       .then(arr => arr.map(
//               ({ properties: { Description }, geometry: { type, coordinates } }) => [polygonFactory(type, coordinates), Description.match(/<td>([^<]*)<\/td>/)[1]]))
//

/**
 * @type {Promise<[AbstractBounds, string][]>}
 */
const polygons = fetch("https://www.onemap.gov.sg/api/public/popapi/getAllPlanningarea", {
  headers: {
    Authorization: ONEMAP_API_KEY
  }
}).then(obj => obj.json())
  .then(
    ({ SearchResults }) => SearchResults.map(({ geojson, pln_area_n }) => {
      const { type, coordinates } = JSON.parse(geojson);
      return [polygonFactory(type, coordinates), pln_area_n];
    }))
  .then(
    obj => {
      console.log("Data loaded successfully")
      return obj
    }
  )

/**
 * @param {LngLat} coords
 * @returns {Promise<string | undefined>}
 */
export async function findAreaName(coords) {
  return polygons.then(arr => arr.find(([poly]) => poly.inBoundary(coords))?.[1])
}

/**
 * @param {string} searchVal
 * @param {number} pageNum
 */
export async function searchLocation(searchVal, pageNum = 1) {
  return fetch(`https://www.onemap.gov.sg/api/common/elastic/search?${new URLSearchParams({
    searchVal,
    returnGeom: 'Y',
    getAddrDetails: 'Y',
    pageNum: pageNum.toString()
  })}`)
    .then(res => res.json())
    .then(
      /**
       * @param {Object} param0
       * @param {number} param0.totalNumPages
       * @param {number} param0.pageNum
       * @param {Record<"SEARCHVAL"|"BLK_NO"|"ROAD_NAME"|"BUILDING"|"ADDRESS"|"LATITUDE"|"LONGITUDE", string>[]} param0.results
       */
      ({ totalNumPages, pageNum, results }) => ({
        nextPage: totalNumPages < pageNum ? undefined : pageNum + 1,
        results: results.map(
          ({ SEARCHVAL, ADDRESS, LATITUDE, LONGITUDE }) => ({ SEARCHVAL, ADDRESS, LONGITUDE, LATITUDE })
        )
      })
    )
}

/**
 * @param {LngLat} coords
 */
export async function coordsToCommunity(coords) {
  return findAreaName(coords).then(async area => area ? (await getCommunityIdByAreaName(area)).data : undefined)
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
