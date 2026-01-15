const saloonService = require("../../api/saloonService/model")
const mongoose = require("mongoose")

exports.VIEW_SALOON = async (req) => {
  let pipeline = []

  let match = {}
  if (req.query.ServicePrice != undefined && req.query.ServicePrice != "") {
    match.ServicePrice = { $gt: Number(req.query.ServicePrice) }
  }
  
  if (req.query.ServiceName != undefined && req.query.ServiceName != "") {
    match.ServiceName = { $regex: req.query.ServiceName }
  }

  pipeline.push({ '$match': match })

  pipeline.push({
    '$lookup': {
      'from': 'categories',
      'localField': 'category',
      'foreignField': '_id',
      'as': 'category'
    }
  })

  pipeline.push({
    '$unwind': {
      'path': '$category',
      'preserveNullAndEmptyArrays': true
    }
  })
  return await saloonService.aggregate(pipeline)
}