var db = require('../config/connection')
var collection=require('../config/collections')
var objectId = require("mongodb").ObjectId;
const { response } = require('express');
const bcrypt = require('bcrypt')
module.exports={

    addProduct:(product,callback)=>{
        product.price = parseInt(product.price)
        console.log(product)

        db.get().collection('product').insertOne(product).then((data)=>{
            callback(data.insertedId);
            console.log(data.insertedId);
        })

        
    },

    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray()
            resolve(products)
            console.log(products);
        })
    },

    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).deleteOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },

    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },

    updateProduct:(proId,proDetails)=>{
        proDetails.price=parseInt(proDetails.price)
        console.log(proId);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(proId)},{
                $set:{
                    name:proDetails.name,
                    description:proDetails.description,
                    price:proDetails.price,
                    category:proDetails.category
                }
            }).then((response)=>{
                resolve()
            })
        })
    },

    adminLogin:(adminData)=>{
        console.log("AdminData%%%",adminData);
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let admin=await db.get().collection('admin').findOne({email:adminData.email})
            if(admin){
                bcrypt.compare(adminData.password,admin.password).then((status)=>{
                    if(status){
                        console.log("login success");
                        response.admin=admin
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("login failed");
                        resolve({status:false})
                    }
                })
            }else{
                console.log("login attempt failed");
                resolve({status:false})
            }
        })
    }

}

