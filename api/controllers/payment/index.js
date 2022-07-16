const Payment = require("../../models/Payment/Payment");
const { authenticateJWT } = require("../auth");

// filter & get all billing methods
exports.get_billing_list = async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        const {page, limit, email, phone, full_name} = req?.body;
        const pageNumber = Number(page) || 1;
        const nPerPage = Number(limit) || 10;
        const filter_obj = {};
        email && (filter_obj.email = email);
        phone && (filter_obj.phone = phone);
        full_name && (filter_obj.full_name = full_name);
        const billing_list = await Payment.find(filter_obj)
                        .sort( { createdAt: -1 } )
                        .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * nPerPage ) : 0 )
                        .limit( nPerPage );
        
        console.log({billing_list: billing_list.length});
        const total_paid_amount = billing_list.reduce((acc, curr) => {
            return acc + curr.paid_amount;
        }, 0);
        const billing_list_count = await Payment.find(filter_obj).count();
        console.log({billing_list_count});
        return res.status(200).json({
            status: true,
            message: `The number billing list is ${billing_list?.length}!!!`,
            data: {billing_list, billing_data_length: billing_list_count, total_paid_amount: total_paid_amount},
        });

    }else{
        res.status(401).json({
            status: false,
            message: "User is unauthorized to filter billing list!!!",
        });
    }
}

// Create a new billing method
exports.create_billing_method = async(req, res) => {
    console.log("=====34:payment/index/====:Body: ",req.body);
    await authenticateJWT(req, res);
    if(req?.auth){
        const body = req.body;
        const bill_id = "bill_" + Number(new Date());
        body.bill_id = body?.bill_id || bill_id;
        console.log("=====39:payment/index/====:Body: ",body);
        const new_payment = new Payment(body);
        const payment_details = await new_payment.save();
        res.status(200).json({
            status: true,
            message: "The billing method is successfully created!!!",
            data: payment_details,
        });
    }else{
        res.status(401).json({
            status: false,
            message: "User is unauthorized to create billing method!!!",
        });
    }
}

// Update a billing method
exports.update_billing_method = async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        const body = req.body;
        const {id: bill_id} = req.params;
        console.log({bill_id, body});
        try {
            const payment_details = await Payment.findOneAndUpdate({bill_id}, body, {new: true});
            if(!payment_details){
                return res.status(404).json({
                    status: false,
                    message: "The billing method isn't exists to update!!!",
                });
            }
            res.status(200).json({
                status: true,
                message: "The billing method is successfully updated!!!",
                data: payment_details,
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error?.message || "Server error!!!"
            })
        }
    }else{
        res.status(401).json({
            status: false,
            message: "User is unauthorized to update billing method!!!",
        });
    }
}

// Delete a billing method
exports.delete_billing_method = async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        const {id: bill_id} = req.params;
        try {
            const payment_details_res = await Payment.findOneAndRemove({bill_id});
            // console.log({payment_details_res});
            if(!payment_details_res){
                return res.status(404).json({
                    status: false,
                    message: "The billing method isn't exists to delete!!!",
                });
            }
            res.status(200).json({
                status: true,
                message: "The billing method is successfully deleted!!!",
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error?.message || "Server error!!!"
            })
        }
    }else{
        res.status(401).json({
            status: false,
            message: "User is unauthorized to delete billing method!!!",
        });
    }
}
