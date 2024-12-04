const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');


// กำหนดที่จัดเก็บไฟล์ ตั้งค่า storage ของ multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));// ตั้งชื่อไฟล์ไม่ให้ซ้ำ
    }
});

const upload = multer({ storage });
// เส้นทางสำหรับให้บริการไฟล์รูปภาพ ตั้งค่า express.static เพื่อให้สามารถเข้าถึงไฟล์ที่อัปโหลด
//app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "12345678",
    database: "project_jiracake"
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to the database');
});

app.post('/upload', upload.single('image'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send({ filename: file.filename });
});

/* *************************************************Login**************************************************** */

app.post('/loginuser', (req, res) => {
    const { username, password } = req.body;

    // ตรวจสอบในตาราง admin
    const sqlCheckAdmin = "SELECT * FROM admin WHERE UserName = ?";
    // ตรวจสอบในตาราง member
    const sqlCheckMember = "SELECT * FROM member WHERE UserNameMem = ?";

    db.query(sqlCheckAdmin, [username], (err, dataAdmin) => {
        if (err) return res.json({ message: "Error" });

        // หากพบผู้ใช้ในตาราง admin
        if (dataAdmin.length > 0) {
            const admin = dataAdmin[0];
            if (admin.PassWord === password) {
                // ส่งข้อมูล IDAdmin กลับเมื่อล็อกอินสำเร็จ
                return res.json({
                    message: "Login Success",
                    userType: 'admin',
                    IDAdmin: admin.IDAdmin // ส่ง IDAdmin ที่นี่
                });
            } else {
                return res.json({ message: "รหัสผ่านไม่ถูกต้อง!" });
            }
        } else {
            // หากไม่พบผู้ใช้ในตาราง admin ให้ตรวจสอบในตาราง member
            db.query(sqlCheckMember, [username], (err, dataMember) => {
                if (err) return res.json({ message: "Error" });

                // หากพบผู้ใช้ในตาราง member
                if (dataMember.length > 0) {
                    const member = dataMember[0];
                    if (member.PassWordMem === password) {
                        // ส่งข้อมูล IDMem กลับไปด้วย
                        return res.json({
                            message: "Login Success",
                            userType: 'member',
                            IDMem: member.IDMem // ส่ง IDMem ที่นี่
                        });
                    } else {
                        return res.json({ message: "รหัสผ่านไม่ถูกต้อง!" });
                    }
                } else {
                    return res.json({ message: "ไม่พบบัญชีผู้ใช้!" });
                }
            });
        }
    });
});
// Login for Admin
/*
app.post('/loginadmin', (req, res) => {
    const { username, password } = req.body;
    const sqlCheckAdmin = "SELECT * FROM admin WHERE UserName = ?";

    db.query(sqlCheckAdmin, [username], (err, dataAdmin) => {
        if (err) return res.json({ message: "Error" });

        if (dataAdmin.length > 0) {
            const admin = dataAdmin[0];
            if (admin.PassWord === password) {
                return res.json({
                    message: "Login Success",
                    userType: 'admin',
                    IDAdmin: admin.IDAdmin
                });
            } else {
                return res.json({ message: "รหัสผ่านไม่ถูกต้อง!" });
            }
        } else {
            return res.json({ message: "ไม่พบบัญชีผู้ดูแลระบบ!" });
        }
    });
});

// Login for Member
app.post('/loginmember', (req, res) => {
    const { username, password } = req.body;
    const sqlCheckMember = "SELECT * FROM member WHERE UserNameMem = ?";

    db.query(sqlCheckMember, [username], (err, dataMember) => {
        if (err) return res.json({ message: "Error" });

        if (dataMember.length > 0) {
            const member = dataMember[0];
            if (member.PassWordMem === password) {
                return res.json({
                    message: "Login Success",
                    userType: 'member',
                    IDMem: member.IDMem
                });
            } else {
                return res.json({ message: "รหัสผ่านไม่ถูกต้อง!" });
            }
        } else {
            return res.json({ message: "ไม่พบบัญชีผู้ใช้!" });
        }
    });
});*/

/*app.post('/loginadmin', (req, res) => { 
    const { username, password } = req.body;

    // ตรวจสอบว่า username มีอยู่หรือไม่ก่อน
    const sqlCheckUsername = "SELECT * FROM admin WHERE UserName = ?";
    db.query(sqlCheckUsername, [username], (err, data) => {
        if (err) return res.json("Error");

        if (data.length === 0) {
            // ถ้าไม่เจอ username ในฐานข้อมูล
            return res.json("Invalid username");
        } else {
            // ถ้าเจอ username แล้วให้ตรวจสอบ password
            const sqlCheckPassword = "SELECT * FROM admin WHERE UserName = ? AND PassWord = ?";
            db.query(sqlCheckPassword, [username, password], (err, data) => {
                if (err) return res.json("Error");

                if (data.length > 0) {
                    // ถ้า username และ password ถูกต้อง
                    return res.json("Login Success");
                } else {
                    // ถ้า password ผิด
                    return res.json("Invalid password");
                }
            });
        }
    });
});*/

app.get('/api/user', (req, res) => {
    const userName = req.query.userName; // สมมติว่า userName ถูกส่งมาใน query string
    if (!userName) {
        return res.status(400).json({ error: 'userName is required' });
    }

    const query = 'SELECT Name, Sname FROM admin WHERE UserName = ?';
    db.query(query, [userName], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (result.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result[0]);
    });
});

// Fetch users from view_user table
app.get('/users', (req, res) => {
    const sql = 'SELECT * FROM view_user';  // Adjust table/view name if necessary

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: err });
        }
        res.json(result);
    });
});
//************************************โชว์ข้อมูลในตารางหน้าTypePro**********************************************
app.get('/typeproduct', (req, res) => {
    db.query("SELECT * FROM type_product", (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query error');
        } else {
            res.json(result);
        }
    });
});

//เพิ่มข้อมูลในtype_productตารางหน้าTypePro_Add
app.post('/typeproduct', (req, res) => {
    const { TypeName, stType } = req.body;
    db.query("INSERT INTO type_product (TypeName, stType) VALUES (?, ?)", [TypeName, stType], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query error');
        } else {
            res.json(result);
        }
    });
});

//อัพเดทข้อมูลในtype_productตารางหน้าTypePro_update
app.put('/typeproduct/:IDType', (req, res) => {
    const sql = "UPDATE type_product SET `TypeName` = ?, `stType` = ? WHERE IDType = ?";
    const { IDType } = req.params;
    const { TypeName, stType } = req.body;

    db.query(sql, [TypeName, stType, IDType], (err, result) => {
        if (err) {
            console.error('Error in SQL query:', err);
            return res.status(500).json({ Message: "Error inside server" });
        }
        res.json(result);
    });
});

//โชว์ข้อมูลในตารางหน้าอัพเดทTypePro_update
app.get('/typeproduct/:IDType', (req, res) => {
    const { IDType } = req.params;
    db.query("SELECT * FROM type_product WHERE IDType = ?", [IDType], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query error');
        } else {
            console.log('API Response:', result); // Log result
            if (result.length === 0) {
                console.log('No records found for IDType:', IDType);
                res.status(404).json({ Message: 'No records found' });
            } else {
                res.json(result);
            }
        }
    });
});

//  ลบข้อมูลหน้าtypepro
app.delete('/typeproduct/:IDType', (req, res) => {
    const IDType = req.params.IDType;

    db.query("DELETE FROM type_product WHERE IDType = ?", [IDType], (err, result) => {
        if (err) {
            console.error("Error deleting the product type:", err);
            res.status(500).send("Error deleting the product type");
        } else {
            res.send({ message: "Product type deleted successfully", result });
        }
    });
});


//***************************************โชว์ข้อมูลในตารางหน้าProduct*********************************************************************

app.get("/product", (req, res) => {
    const sql = `
      SELECT 
        h.IDProduct, 
        h.NamePro, 
        h.DetailPro, 
        h.UnitPro, 
        h.UnitCount, 
        h.SalePrice, 
        h.CostPrice, 
        h.ReorderPoint, 
        h.Date,
        h.ShelfLife,  
        c.TypeName, 
        h.ImagePro, 
        h.stPro 
      FROM product h 
      JOIN type_product c 
      ON h.IDType = c.IDType
    `;
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching product data:', err);
            return res.status(500).json("Error fetching product data");
        }
        return res.json(data);
    });
});


// Route สำหรับดึงประเภทสินค้า
app.get('/types', (req, res) => {
    const query = 'SELECT * FROM type_product';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching product types:', err);
            res.status(500).send('Error fetching product types');
        } else {
            res.json(results);
        }
    });
});

// เพิ่มสินค้า
app.post('/addproduct', upload.single('ImagePro'), (req, res) => {
    const { NamePro, DetailPro, UnitPro, UnitCount, CostPrice, ReorderPoint, SalePrice, Date, ShelfLife, IDType, stPro } = req.body;
    const ImagePro = req.file ? req.file.path : null; // ได้ path ของไฟล์ที่อัปโหลด

    const query = `
        INSERT INTO product (NamePro, DetailPro, UnitPro, UnitCount, CostPrice, ReorderPoint, SalePrice, Date, ShelfLife, IDType, ImagePro, stPro) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [NamePro, DetailPro, UnitPro, UnitCount, CostPrice, ReorderPoint, SalePrice, Date, ShelfLife, IDType, ImagePro, stPro], (err, result) => {
        if (err) {
            console.error('Error adding product:', err);
            res.status(500).send('Error adding product');
        } else {
            res.send('Product added successfully');
        }
    });
});


// Route สำหรับดึงสินค้าทั้งหมด
app.get('/product', (req, res) => {
    const query = 'SELECT * FROM product';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Error fetching products');
        } else {
            res.json(results);
        }
    });
});


//อัพเดทข้อมูลในหน้าProduct
app.put('/updateproduct/:IDProduct', upload.single('ImagePro'), (req, res) => {
    const { IDProduct } = req.params;
    const { NamePro, DetailPro, UnitPro, UnitCount, CostPrice, ReorderPoint, SalePrice, Date, ShelfLife, IDType, stPro } = req.body;
    let ImagePro = req.file ? req.file.filename : '';

    let sql;
    let values;

    if (ImagePro) {
        sql = `UPDATE product SET NamePro = ?, DetailPro = ?, UnitPro = ?, UnitCount = ?, CostPrice = ?, 
                ReorderPoint = ?, SalePrice = ?, Date = ?, IDType = ?,ShelfLife = ?, ImagePro = ?, stPro = ? WHERE IDProduct = ?`;
        values = [NamePro, DetailPro, UnitPro, UnitCount, CostPrice, ReorderPoint, SalePrice, Date, ShelfLife, IDType, ImagePro, stPro, IDProduct];
    } else {
        sql = `UPDATE product SET NamePro = ?, DetailPro = ?, UnitPro = ?, UnitCount = ?, CostPrice = ?, 
                ReorderPoint = ?, SalePrice = ?, Date = ?, IDType = ?,ShelfLife = ?, stPro = ? WHERE IDProduct = ?`;
        values = [NamePro, DetailPro, UnitPro, UnitCount, CostPrice, ReorderPoint, SalePrice, Date, ShelfLife, IDType, stPro, IDProduct];
    }

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error in SQL query:', err);
            return res.status(500).json({ Message: "Error inside server" });
        }
        res.json(result);
    });
});


//โชว์ข้อมูลในหน้าProductอัพเดท
app.get('/product/:IDProduct', (req, res) => {
    const { IDProduct } = req.params;
    const sql = `
        SELECT product.*, type_product.TypeName 
        FROM product 
        LEFT JOIN type_product ON product.IDType = type_product.IDType 
        WHERE product.IDProduct = ?`;

    db.query(sql, [IDProduct], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Database query error');
        }

        if (result.length === 0) {
            return res.status(404).json({ Message: "Product not found" });
        }

        res.json(result[0]);
    });
});

// Endpoint to fetch all product types
app.get('/typeproduct', (req, res) => {
    const sql = `SELECT IDType, TypeName FROM type_product`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Database query error');
        }

        res.json(result);
    });
});

//  ลบข้อมูลหน้าproduct
app.delete('/product/:IDProduct', (req, res) => {
    const IDProduct = req.params.IDProduct;

    db.query("DELETE FROM product WHERE IDProduct = ?", [IDProduct], (err, result) => {
        if (err) {
            console.error("Error deleting the product:", err);
            res.status(500).send("Error deleting the product");
        } else {
            res.send({ message: "Product deleted successfully", result });
        }
    });
});
/*********************************************คลังสินค้า******************************************* */
// Endpoint to get stock data
app.get('/stock', (req, res) => {
    db.query("SELECT * FROM stock", (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query error');
        }
        res.json(result);
    });
});

// Endpoint to add product quantity
app.put('/addproductquantity/:IDProduct', (req, res) => {
    const { IDProduct } = req.params;
    const { quantity } = req.body; // Get the quantity to add

    // Check if quantity is defined and greater than zero
    if (quantity === undefined || quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be greater than zero.' });
    }

    // SQL query to update the product's quantity
    const sql = 'UPDATE product SET UnitPro = UnitPro + ? WHERE IDProduct = ?';
    db.query(sql, [quantity, IDProduct], (err, result) => {
        if (err) {
            console.error('Error updating product quantity:', err);
            return res.status(500).json({ message: 'Error updating product quantity.' });
        }
        res.json({ message: 'Product quantity updated successfully.', result });
    });
});
app.post('/log_activity', (req, res) => {
    const activity = req.body;
    // Here you would typically save the activity to a database
    console.log('Activity logged:', activity);
    res.status(201).send({ message: 'Activity logged successfully' });
});
app.post('/logActivity', (req, res) => {
    const { action, productName, date } = req.body;

    // Add logic to log the activity (e.g., save to a database)
    console.log(`Action: ${action}, Product Name: ${productName}, Date: ${date}`);

    res.status(200).send({ message: 'Activity logged successfully.' });
});

//รับเข้าสินค้า ยังไม่ได้!!
app.post('/api/receive-stock', (req, res) => {
    const { IDProduct, StockIn } = req.body;

    // ตรวจสอบข้อมูลที่ส่งเข้ามา
    if (!IDProduct || !StockIn || StockIn <= 0) {
        return res.status(400).send("Valid IDProduct and StockIn are required");
    }

    const query = `
        UPDATE stock
        SET 
            StockIn = StockIn + ?, 
            CurrentStock = CurrentStock + ?,
            LastUpdate = NOW(), 
            ExpirationDate = DATE_ADD(
                (SELECT Date FROM product WHERE IDProduct = ?),
                INTERVAL (SELECT ShelfLife FROM product WHERE IDProduct = ?) DAY
            )
        WHERE IDProduct = ?;
    `;

    db.query(query, [StockIn, StockIn, IDProduct, IDProduct, IDProduct], (err, result) => {
        if (err) {
            console.error("Database error:", err); // Log the error for debugging
            return res.status(500).send("Database error occurred");
        }

        // ตรวจสอบผลลัพธ์
        if (result.affectedRows === 0) {
            return res.status(404).send("Product not found");
        }

        res.status(200).send('Stock updated successfully');
    });
});
//ช่องเลือกสินค้า
app.get('/api/productst', (req, res) => {
    const query = 'SELECT * FROM product WHERE stPro = "Y"'; // แสดงเฉพาะสินค้าที่สถานะใช้งาน
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).json(results);
    });
});



//*********************************Delivery_Company********************************************
app.get('/deliverycompany', (req, res) => {
    db.query("SELECT * FROM delivery_company", (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query error');
        } else {
            res.json(result);
        }
    });
});

//เพิ่มข้อมูลในtype_productตารางหน้าDelivery_Company
app.post('/adddeliverycom', (req, res) => {
    const { NameCompany, Telcom, Addresscom, stCompany } = req.body;
    db.query("INSERT INTO delivery_company (NameCompany, Telcom, Addresscom, stCompany) VALUES (?, ?, ?, ?)",
        [NameCompany, Telcom, Addresscom, stCompany], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Database query error');
            } else {
                res.json(result);
            }
        });
});

// อัพเดทข้อมูลใน delivery_company
app.put('/updatedeliverycom/:IDCompany', (req, res) => {
    const { IDCompany } = req.params; // ใช้ req.params แทน useParams
    const data = req.body;

    db.query(
        'UPDATE delivery_company SET NameCompany = ?, Telcom = ?, Addresscom = ?, stCompany = ? WHERE IDCompany = ?',
        [data.NameCompany, data.Telcom, data.Addresscom, data.stCompany, IDCompany],
        (err, result) => {
            if (err) {
                console.error('Database update error:', err);
                return res.status(500).send('Database update error');
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Company not found' });
            }
            res.json({ message: 'Company updated successfully' });
        }
    );
});

// โชว์ข้อมูลบริษัทที่ต้องการอัพเดท
app.get('/member/:IDMem', (req, res) => {
    const { IDMem } = req.params;
    db.query("SELECT * FROM member WHERE IDMem = ?", [IDMem], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Database query error');
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.json(result[0]); // ส่งกลับแถวแรกของผลลัพธ์
    });
});

// ลบ
app.delete('/deliverycompany/:IDCompany', (req, res) => {
    const IDCompany = req.params.IDCompany;

    db.query("DELETE FROM delivery_company WHERE IDCompany = ?", [IDCompany], (err, result) => {
        if (err) {
            console.error("Error deleting the product type:", err);
            res.status(500).send("Error deleting the product type");
        } else {
            res.send({ message: "Product type deleted successfully", result });
        }
    });
});

/**********************************************Member******************************************** */
//โชว์ข้อมูลในตาราง
app.get('/members', (req, res) => {
    const query = 'SELECT * FROM member';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//เพิ่มสามาชิกmember
app.post('/addmember', (req, res) => {
    const { TitleMem, NameMem, SnameMem, UserNameMem, PassWordMem, PositionMem, EmailMem, TelMem } = req.body;
    const query = `INSERT INTO member (TitleMem, NameMem, SnameMem, UserNameMem, PassWordMem, PositionMem, EmailMem, TelMem, stMem)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'y')`;
    db.query(query, [TitleMem, NameMem, SnameMem, UserNameMem, PassWordMem, PositionMem, EmailMem, TelMem], (err, result) => {
        if (err) {
            console.error('Error adding member:', err);
            res.status(500).send('Error adding member');
            return;
        }
        res.status(200).send('Member added successfully');
    });
});

// ดึงข้อมูลสมาชิกตาม ID
app.get('/member/:IDMem', (req, res) => {
    const memberId = req.params.IDMem; // เปลี่ยนจาก req.params.id เป็น req.params.IDMem
    const query = 'SELECT * FROM members WHERE IDMem = ?';

    db.query(query, [memberId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
        } else if (results.length === 0) {
            res.status(404).send('No data found');
        } else {
            res.json(results[0]);
        }
    });
});


//อัพเดท
app.put('/updatemember/:IDMem', (req, res) => {
    const { IDMem } = req.params; // ใช้ req.params แทน useParams
    const data = req.body;

    db.query(
        'UPDATE member SET TitleMem = ?, NameMem = ?, SnameMem = ?, UserNameMem = ?, PassWordMem = ?, PositionMem = ?, EmailMem = ?, TelMem = ?, stMem = ? WHERE IDMem = ?',
        [data.TitleMem, data.NameMem, data.SnameMem, data.UserNameMem, data.PassWordMem, data.PositionMem, data.EmailMem, data.TelMem, data.stMem, IDMem],
        (err, result) => {
            if (err) {
                console.error('Database update error:', err);
                return res.status(500).send('Database update error');
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Member not found' });
            }
            res.json({ message: 'Member updated successfully' });
        }
    );
});

//ลบ
app.delete('/member/:IDMem', (req, res) => {
    const IDMem = req.params.IDMem;

    db.query("DELETE FROM member WHERE IDMem = ?", [IDMem], (err, result) => {
        if (err) {
            console.error("Error deleting the member:", err);
            return res.status(500).send("Error deleting the member");
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Member not found" });
        }
        res.send({ message: "Member deleted successfully", result });
    });
});
/***************************************************โปรไฟล์*********************************************** */


// อัปเดตรหัสผ่านของสมาชิก
app.post('/change-password', (req, res) => {
    const { IDMem, oldPassword, newPassword } = req.body;

    // Check that all fields are provided
    if (!IDMem || !oldPassword || !newPassword) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // Fetch the current password for the member
    const sqlFetchPassword = 'SELECT PassWordMem FROM member WHERE IDMem = ?';
    db.query(sqlFetchPassword, [IDMem], (err, result) => {
        if (err) {
            console.error('Error fetching password:', err);
            return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' });
        }

        // Check if the member exists
        if (result.length === 0) {
            return res.status(404).json({ error: 'ไม่พบสมาชิก' });
        }

        const currentPassword = result[0].PassWordMem;

        // Validate old password
        if (oldPassword !== currentPassword) {
            return res.status(401).json({ error: 'รหัสผ่านเก่าไม่ถูกต้อง' });
        }

        // Update to the new password
        const sqlUpdatePassword = 'UPDATE member SET PassWordMem = ? WHERE IDMem = ?';
        db.query(sqlUpdatePassword, [newPassword, IDMem], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' });
            }

            res.status(200).json({ message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
        });
    });
});

// โชว์ข้อมูล Profile
app.get('/profile/:id', (req, res) => {
    const IDMem = req.params.id;

    const sqlFetchProfile = 'SELECT * FROM member WHERE IDMem = ?';
    db.query(sqlFetchProfile, [IDMem], (err, result) => {
        if (err) {
            console.error('Error fetching profile:', err);
            return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์' });
        }

        // Check if the member exists
        if (result.length === 0) {
            return res.status(404).json({ error: 'ไม่พบสมาชิก' });
        }
        res.status(200).json(result[0]);
    });
});
// Update Member Profile
app.put('/profile/:id', upload.single('ImageMem'), (req, res) => {
    const IDMem = req.params.id;
    const { TitleMem, NameMem, SnameMem, UserNameMem, EmailMem, TelMem, PositionMem } = req.body;

    let updateQuery = `
        UPDATE member
        SET TitleMem = ?, NameMem = ?, SnameMem = ?, UserNameMem = ?, EmailMem = ?, TelMem = ?, PositionMem = ?
    `;
    let values = [TitleMem, NameMem, SnameMem, UserNameMem, EmailMem, TelMem, PositionMem];

    // Check if an image was uploaded
    if (req.file) {
        const ImageMem = req.file.filename; // Use the filename from Multer
        updateQuery += ', ImageMem = ?';
        values.push(ImageMem);
    }

    updateQuery += ' WHERE IDMem = ?';
    values.push(IDMem);

    db.query(updateQuery, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database update failed' });
        }
        res.json({ message: 'อัปเดตข้อมูลเรียบร้อยแล้ว' });
    });
});


/*************************************************ที่อยู่mem_address*************************************************/
//โชว์ข้อมูล
// Endpoint to get addresses by IDMem
app.get('/getAddresses', (req, res) => {
    const { IDMem } = req.query; // Get IDMem from query parameters

    if (!IDMem) {
        return res.status(400).json({ message: 'IDMem is required' });
    }

    // SQL query to fetch addresses
    const query = 'SELECT * FROM mem_address WHERE IDMem = ?';

    db.query(query, [IDMem], (err, results) => {
        if (err) {
            console.error('Error fetching addresses:', err);
            return res.status(500).json({ message: 'Error fetching addresses' });
        }

        res.json(results); // Send the results as JSON
    });
});

// เพิ่มที่อยู่ใหม่
app.post('/addaddress', (req, res) => {
    const { NameAddress, TelAddress, HouseNumber, Sol, Road, Moo, Village, Tambon, Amphoe, Province, ZipCode, IDMem } = req.body;

    // ตรวจสอบว่าข้อมูลถูกส่งมาครบถ้วน
    if (!NameAddress || !TelAddress || !HouseNumber || !Tambon || !Amphoe || !Province || !ZipCode || !IDMem) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // คำสั่ง SQL สำหรับเพิ่มที่อยู่ใหม่
    const sql = `
        INSERT INTO mem_address (NameAddress,TelAddress,HouseNumber, Sol, Road, Moo, Village, Tambon, Amphoe, Province, ZipCode, IDMem)
        VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // ทำการเพิ่มข้อมูลเข้าไปในตาราง mem_address
    db.query(sql, [NameAddress, TelAddress, HouseNumber, Sol, Road, Moo, Village, Tambon, Amphoe, Province, ZipCode, IDMem], (err, result) => {
        if (err) {
            console.error('Error inserting address:', err);
            return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มที่อยู่' });
        }

        res.status(200).json({ message: 'เพิ่มที่อยู่เรียบร้อยแล้ว' });
    });
});
// Route สำหรับดึงข้อมูลที่อยู่ตาม IDAddress
app.get('/address/:id', (req, res) => {
    const id = req.params.id;

    const query = 'SELECT * FROM mem_address WHERE IDAddress = ?';
    db.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error fetching address:', error);
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลที่อยู่' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลที่อยู่' });
        }
        res.json(results[0]); // ส่งข้อมูลที่อยู่กลับไป
    });
});

// Update address endpoint
app.put('/updateAddress/:IDAddress', (req, res) => {
    const { IDAddress } = req.params;
    const { NameAddress, TelAddress, HouseNumber, Sol, Road, Moo, Village, Tambon, Amphoe, Province, ZipCode } = req.body;

    // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วน
    if (!NameAddress || !TelAddress || !HouseNumber || !Road || !Moo || !Village || !Tambon || !Amphoe || !Province || !ZipCode) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const sql = `UPDATE mem_address SET NameAddress = ?, TelAddress = ?, HouseNumber = ?, Sol = ?, Road = ?, Moo = ?, Village = ?, Tambon = ?, Amphoe = ?, Province = ?, ZipCode = ? WHERE IDAddress = ?`;

    db.query(sql, [NameAddress, TelAddress, HouseNumber, Sol, Road, Moo, Village, Tambon, Amphoe, Province, ZipCode, IDAddress], (err, result) => {
        if (err) {
            console.error('Error updating address:', err);
            return res.status(500).send('ไม่สามารถอัปเดตข้อมูลที่อยู่ได้');
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'ไม่พบที่อยู่ที่ต้องการอัปเดต' });
        }
        res.json({ message: 'อัปเดตข้อมูลที่อยู่สำเร็จ' });
    });
});


// ลบที่อยู่
app.delete('/deleteaddress/:IDAddress', (req, res) => {
    const { IDAddress } = req.params;

    // ตรวจสอบว่า IDAddress ถูกส่งมาหรือไม่
    if (!IDAddress) {
        return res.status(400).json({ error: 'กรุณาระบุรหัสที่อยู่' });
    }

    // คำสั่ง SQL สำหรับลบที่อยู่จากตาราง mem_address
    const sql = `DELETE FROM mem_address WHERE IDAddress = ?`;

    // ทำการลบข้อมูลที่อยู่จากตาราง mem_address
    db.query(sql, [IDAddress], (err, result) => {
        if (err) {
            console.error('Error deleting address:', err);
            return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบที่อยู่' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'ไม่พบที่อยู่ที่ต้องการลบ' });
        }

        res.status(200).json({ message: 'ลบที่อยู่เรียบร้อยแล้ว' });
    });
});

//*******************************************************Admin********************************************* 
//โชว์ข้อมูลในตาราง
app.get('/admins', (req, res) => {
    const query = 'SELECT * FROM admin';
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching admins:", err);
            return res.status(500).send("Error fetching admins");
        }
        res.json(results);
    });
});

//เพิ่ม
app.post('/addadmin', (req, res) => {
    const { Title, Name, Sname, UserName, PassWord, Position, Email, Tel, Address } = req.body;
    const query = `INSERT INTO admin (Title, Name, Sname, UserName, PassWord, Position, Email, Tel, Address, stAdmin)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'y')`;
    db.query(query, [Title, Name, Sname, UserName, PassWord, Position, Email, Tel, Address], (err, result) => {
        if (err) {
            console.error('Error adding admin:', err);
            res.status(500).send('Error adding admin');
            return;
        }
        res.status(200).send('Admin added successfully');
    });
});
//ดึงข้อมูลมาโชว์จากid
app.get('/admin/:IDAdmin', (req, res) => {
    const adminId = req.params.IDAdmin; // เปลี่ยนจาก req.params.IDMem เป็น req.params.IDAdmin
    const query = 'SELECT * FROM admin WHERE IDAdmin = ?';

    db.query(query, [adminId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
        } else if (results.length === 0) {
            res.status(404).send('No data found');
        } else {
            res.json(results[0]);
        }
    });
});
//อัพเดทท
app.put('/updateadmin/:IDAdmin', (req, res) => {
    const { IDAdmin } = req.params; // ใช้ req.params แทน useParams
    const data = req.body;

    db.query(
        'UPDATE admin SET Title = ?, Name = ?, Sname = ?, UserName = ?, PassWord = ?, Position = ?, Email = ?, Tel = ?, Address = ?, stAdmin = ? WHERE IDAdmin = ?',
        [data.Title, data.Name, data.Sname, data.UserName, data.PassWord, data.Position, data.Email, data.Tel, data.Address, data.stAdmin, IDAdmin],
        (err, result) => {
            if (err) {
                console.error('Database update error:', err);
                return res.status(500).send('Database update error');
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Admin not found' });
            }
            res.json({ message: 'Admin updated successfully' });
        }
    );
});
//ลบ
app.delete('/admin/:IDAdmin', (req, res) => {
    const IDAdmin = req.params.IDAdmin;

    db.query("DELETE FROM admin WHERE IDAdmin = ?", [IDAdmin], (err, result) => {
        if (err) {
            console.error("Error deleting the admin:", err);
            return res.status(500).send("Error deleting the admin");
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.send({ message: "Admin deleted successfully", result });
    });
});
/******************************************profile admin************************************************** */
// เส้นทางสำหรับการดึงข้อมูลผู้ดูแลระบบ
app.get('/adminprofile/:IDAdmin', (req, res) => {
    const { IDAdmin } = req.params;
    const query = 'SELECT * FROM admin WHERE IDAdmin = ?';
    db.query(query, [IDAdmin], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error fetching admin data' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(results[0]);
    });
});

// เส้นทางสำหรับการอัปเดตข้อมูลผู้ดูแลระบบ
app.put('/adminprofile/:IDAdmin', (req, res) => {
    const { IDAdmin } = req.params;
    const { Title, Name, Sname, UserName, Email, Tel, Address, Position } = req.body;

    const query = 'UPDATE admin SET Title = ?, Name = ?, Sname = ?, UserName = ?, Email = ?, Tel = ?, Address = ?, Position = ? WHERE IDAdmin = ?';

    db.query(query, [Title, Name, Sname, UserName, Email, Tel, Address, Position, IDAdmin], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error updating admin profile' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({ message: 'Admin profile updated successfully' });
    });
});
/***********************************************ตะกร้าสินค้า************************************************* */
//เพิ่ม

// Add to cart
app.post('/api/cart', (req, res) => {
    const { IDMem, IDProduct, Quantity } = req.body;

    const query = `
        INSERT INTO cart (IDMem, IDProduct, Quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE Quantity = Quantity + ?;
    `;

    db.query(query, [IDMem, IDProduct, Quantity, Quantity], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Database error occurred");
        }
        res.status(200).send('Product added to cart');
    });
});

//ดึง
// Get cart items for a specific member
app.get('/api/cart/:IDMem', (req, res) => {
    const IDMem = req.params.IDMem;

    const query = `
        SELECT c.IDCart, c.IDProduct, c.Quantity, p.NamePro, p.UnitPro, p.SalePrice
        FROM cart c
        JOIN product p ON c.IDProduct = p.IDProduct
        WHERE c.IDMem = ?;
    `;

    db.query(query, [IDMem], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Database error occurred");
        }
        res.status(200).json(results);
    });
});


/*
// API สำหรับการดึงข้อมูลตะกร้าสินค้า
app.get('/cart/:memberId', (req, res) => {
    const memberId = req.params.memberId;
    const query = 'SELECT * FROM cart WHERE IDMem = ?';
    db.query(query, [memberId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

// API สำหรับการเพิ่มสินค้าในตะกร้า
app.post('/cart', (req, res) => {
    const { IDMem, IDProduct, quantity } = req.body;
    const query = 'INSERT INTO cart (IDMem, IDProduct, quantity) VALUES (?, ?, ?)';
    db.query(query, [IDMem, IDProduct, quantity], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(201).json({ message: 'Product added to cart' });
    });
});

// API สำหรับการอัปเดตจำนวนสินค้าในตะกร้า
app.put('/cart/:cartId', (req, res) => {
    const { quantity } = req.body;
    const cartId = req.params.cartId;
    const query = 'UPDATE cart SET quantity = ? WHERE IDCart = ?';
    db.query(query, [quantity, cartId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json({ message: 'Cart updated' });
    });
});

// API สำหรับการลบสินค้าในตะกร้า
app.delete('/cart/:cartId', (req, res) => {
    const cartId = req.params.cartId;
    const query = 'DELETE FROM cart WHERE IDCart = ?';
    db.query(query, [cartId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json({ message: 'Product removed from cart' });
    });
});
*/

/************************************คำสั่งซื้อ************************************* */

// เส้นทางสำหรับดึงที่อยู่ของผู้ใช้
app.get('/getAddresses', (req, res) => {
    const IDMem = req.query.IDMem;

    db.query('SELECT * FROM mem_address WHERE IDMem = ?', [IDMem], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});
// Endpoint สำหรับดึงบริษัทขนส่ง
/*
app.get('/getDeliveryCompanies', (req, res) => {
    const query = 'SELECT * FROM delivery_company'; // สมมติว่าตารางชื่อ `delivery_company`
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching delivery companies:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});*/
// Route สำหรับดึงข้อมูลบริษัทขนส่ง
app.get('/getDeliveryCompanies', (req, res) => {
    const query = 'SELECT IDCompany, NameCompany, Telcom FROM delivery_company'; // ปรับชื่อคอลัมน์และตารางตามความเหมาะสม
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching delivery companies:', err);
            return res.status(500).json({ error: 'Failed to fetch delivery companies' });
        }
        res.json(results);
    });
});

/*
//สั่งได้แล้ว
app.post('/api/orders', (req, res) => {
    const {
        IDMem,
        recipientName,
        deliveryAddress,
        phoneNumber,
        paymentMethod,
        deliveryCompany,
        TrackingID,
        products
    } = req.body;

    // Step 1: Calculate TotalPrice, CostPrice, and Profit
    let totalOrderPrice = 0;
    let totalOrderCostPrice = 0;
    let totalOrderProfit = 0;
    let totalQuantity = 0;

    products.forEach(product => {
        totalOrderPrice += product.Price * product.Quantity;
        totalOrderCostPrice += product.CostPrice * product.Quantity;
        totalOrderProfit += product.Profit * product.Quantity;
        totalQuantity += product.Quantity;
    });

    // Step 2: Insert into order_list
    const orderQuery = `INSERT INTO order_list (IDMem, Profit, TotalPrice, Quantity,  CostPrice, TrackingID, stOrder, IDPayment, IDAddress, IDCompany, Date) 
                        VALUES (?, ?, ?, ?, ?, ?,'N', ?, ?, ?, NOW())`;


    db.query(orderQuery, [
        IDMem,
        totalOrderProfit.toFixed(2), // Insert calculated total profit
        totalOrderPrice.toFixed(2), // Insert calculated total price
        totalQuantity, // Insert total quantity
        totalOrderCostPrice.toFixed(2), // Insert calculated total cost price
        TrackingID,
        paymentMethod,
        deliveryAddress,
        deliveryCompany
    ], (err, result) => {
        if (err) {
            console.error('Error inserting order:', err);
            return res.status(500).json({ error: 'Failed to place order' });
        }

        const IDOrder = result.insertId; // Get the ID of the newly created order

        // Step 3: Insert the order details with UnitCount from the product table
        const orderDetailsQueries = products.map(product => {
            return new Promise((resolve, reject) => {
                // Step 3.1: Get UnitCount from product table
                const unitCountQuery = `SELECT UnitCount FROM product WHERE IDProduct = ?`;
                db.query(unitCountQuery, [product.IDProduct], (err, unitCountResult) => {
                    if (err || unitCountResult.length === 0) {
                        console.error('Error fetching unit count:', err);
                        return reject(err);
                    }

                    const unitCount = unitCountResult[0].UnitCount; // Get the unit count for the product

                    const detailQuery = `INSERT INTO order_detail (IDOrder, Price, Unit, ReturnProduct, UnitCount, Profit, TotalPrice, stOrder, Date, IDProduct, IDMem) 
                                     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), ?, ?)`;
                    db.query(detailQuery, [
                        IDOrder,
                        product.Price,
                        product.Quantity,
                        'N', // Default ReturnProduct value (not returned)
                        unitCount, // Use unitCount from the product table
                        product.Profit,
                        (product.Price * product.Quantity).toFixed(2), // TotalPrice
                        product.IDProduct,
                        IDMem
                    ], (err) => {
                        if (err) {
                            console.error('Error inserting order details:', err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });
        });


        // Wait for all order details to be inserted
        Promise.all(orderDetailsQueries)
            .then(() => {
                res.status(201).json({ IDOrder });
            })
            .catch(err => {
                res.status(500).json({ error: 'Failed to save order details' });
            });

    });
});
*/
/*
//สั่งงงงง ตัวที่ได้แล้ว
app.post('/api/orders', (req, res) => {
    const {
        IDMem,
        recipientName,
        deliveryAddress,
        phoneNumber,
        paymentMethod,
        deliveryCompany,
        TrackingID,
        products
    } = req.body;

    // Step 1: Calculate TotalPrice, CostPrice, and Profit
    let totalOrderPrice = 0;
    let totalOrderCostPrice = 0;
    let totalOrderProfit = 0;
    let totalQuantity = 0;

    products.forEach(product => {
        totalOrderPrice += product.Price * product.Quantity;
        totalOrderCostPrice += product.CostPrice * product.Quantity;
        totalOrderProfit += product.Profit * product.Quantity;
        totalQuantity += product.Quantity;
    });

    // Step 2: Insert into order_list
    const orderQuery = `INSERT INTO order_list (IDMem, Profit, TotalPrice, Quantity,  CostPrice, TrackingID, stOrder, IDPayment, IDAddress, IDCompany, Date) 
                        VALUES (?, ?, ?, ?, ?, ?, 'N', ?, ?, ?, NOW())`;


    db.query(orderQuery, [
        IDMem,
        totalOrderProfit.toFixed(2), // Insert calculated total profit
        totalOrderPrice.toFixed(2), // Insert calculated total price
        totalQuantity, // Insert total quantity
        totalOrderCostPrice.toFixed(2), // Insert calculated total cost price
        TrackingID,
        paymentMethod,
        deliveryAddress,
        deliveryCompany
    ], (err, result) => {
        if (err) {
            console.error('Error inserting order:', err);
            return res.status(500).json({ error: 'Failed to place order' });
        }

        const IDOrder = result.insertId; // Get the ID of the newly created order

        // Step 3: Insert the order details with UnitCount from the product table
        const orderDetailsQueries = products.map(product => {
            return new Promise((resolve, reject) => {
                // Step 3.1: Get UnitCount from product table
                const unitCountQuery = `SELECT UnitCount FROM product WHERE IDProduct = ?`;
                db.query(unitCountQuery, [product.IDProduct], (err, unitCountResult) => {
                    if (err || unitCountResult.length === 0) {
                        console.error('Error fetching unit count:', err);
                        return reject(err);
                    }

                    const unitCount = unitCountResult[0].UnitCount; // Get the unit count for the product

                    // Step 3.2: Insert into order_detail
                    const detailQuery = `INSERT INTO order_detail (IDOrder, Price, Unit, ReturnProduct, UnitCount, Profit, TotalPrice, stOrder, Date, IDProduct, IDMem) 
                                     VALUES (?, ?, ?, ?, ?, ?, ?, 'N', NOW(), ?, ?)`;
                    db.query(detailQuery, [
                        IDOrder,
                        product.Price,
                        product.Quantity,
                        'N', // Default ReturnProduct value (not returned)
                        unitCount, // Use unitCount from the product table
                        product.Profit,
                        (product.Price * product.Quantity).toFixed(2), // TotalPrice
                        product.IDProduct,
                        IDMem
                    ], (err) => {
                        if (err) {
                            console.error('Error inserting order details:', err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });
        });

        // Wait for all order details to be inserted
        Promise.all(orderDetailsQueries)
            .then(() => {
                res.status(201).json({ IDOrder });
            })
            .catch(err => {
                res.status(500).json({ error: 'Failed to save order details' });
            });
    });
});*/

//เพิ่มตารางpayment
app.post('/api/orders', (req, res) => {
    const {
        IDMem,
        recipientName,
        deliveryAddress,
        phoneNumber,
        paymentMethod,
        deliveryCompany,
        TrackingID,
        products
    } = req.body;

    // Step 1: Calculate TotalPrice, CostPrice, and Profit
    let totalOrderPrice = 0;
    let totalOrderCostPrice = 0;
    let totalOrderProfit = 0;
    let totalQuantity = 0;

    products.forEach(product => {
        totalOrderPrice += product.Price * product.Quantity;
        totalOrderCostPrice += product.CostPrice * product.Quantity;
        totalOrderProfit += product.Profit * product.Quantity;
        totalQuantity += product.Quantity;
    });

    // Step 2: Insert into order_list
    const orderQuery = `INSERT INTO order_list (IDMem, Profit, TotalPrice, Quantity,  CostPrice, TrackingID, stOrder, IDPayment, IDAddress, IDCompany, Date) 
                        VALUES (?, ?, ?, ?, ?, ?, 'P', ?, ?, ?, NOW())`;


    db.query(orderQuery, [
        IDMem,
        totalOrderProfit.toFixed(2), // Insert calculated total profit
        totalOrderPrice.toFixed(2), // Insert calculated total price
        totalQuantity, // Insert total quantity
        totalOrderCostPrice.toFixed(2), // Insert calculated total cost price
        TrackingID,
        paymentMethod,
        deliveryAddress,
        deliveryCompany
    ], (err, result) => {
        if (err) {
            console.error('Error inserting order:', err);
            return res.status(500).json({ error: 'Failed to place order' });
        }

        const IDOrder = result.insertId; // Get the ID of the newly created order

        // Step 3: Insert the order details with UnitCount from the product table
        const orderDetailsQueries = products.map(product => {
            return new Promise((resolve, reject) => {
                // Step 3.1: Get UnitCount from product table
                const unitCountQuery = `SELECT UnitCount FROM product WHERE IDProduct = ?`;
                db.query(unitCountQuery, [product.IDProduct], (err, unitCountResult) => {
                    if (err || unitCountResult.length === 0) {
                        console.error('Error fetching unit count:', err);
                        return reject(err);
                    }

                    const unitCount = unitCountResult[0].UnitCount; // Get the unit count for the product

                    // Step 3.2: Insert into order_detail
                    const detailQuery = `INSERT INTO order_detail (IDOrder, Price, Unit, ReturnProduct, UnitCount, Profit, TotalPrice, stOrder, Date, IDProduct, IDMem) 
                                     VALUES (?, ?, ?, ?, ?, ?, ?, 'P', NOW(), ?, ?)`;
                    db.query(detailQuery, [
                        IDOrder,
                        product.Price,
                        product.Quantity,
                        'N', // Default ReturnProduct value (not returned)
                        unitCount, // Use unitCount from the product table
                        product.Profit,
                        (product.Price * product.Quantity).toFixed(2), // TotalPrice
                        product.IDProduct,
                        IDMem
                    ], (err) => {
                        if (err) {
                            console.error('Error inserting order details:', err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });
        });

        // Wait for all order details to be inserted
        Promise.all(orderDetailsQueries)
            .then(() => {
                res.status(201).json({ IDOrder });
            })
            .catch(err => {
                res.status(500).json({ error: 'Failed to save order details' });
            });
    });
});

app.post('/api/payments', upload.single('image'), (req, res) => {
    const { Pay_Channel, IDOrder } = req.body; // Ensure these are being pulled correctly
    const DatePay = new Date().toISOString().split('T')[0]; // Set current date
    const stPayment = 'y'; // Default value for stPayment
    const ImagePayment = req.file ? req.file.path : null; // Path of the uploaded image

    const paymentQuery = `INSERT INTO payment (DatePay, Pay_Channel, stPayment, ImagePayment, IDOrder) VALUES (?, ?, ?, ?, ?)`;

    db.query(paymentQuery, [DatePay, Pay_Channel, stPayment, ImagePayment, IDOrder], (err, result) => {
        if (err) {
            console.error('เกิดข้อผิดพลาดในการบันทึกการชำระเงิน:', err);
            return res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลการชำระเงินได้' });
        }

        res.status(201).json({ message: 'บันทึกการชำระเงินสำเร็จ', IDPayment: result.insertId });
    });
});
/*

  /*
  // API เพื่อดึงข้อมูลคำสั่งซื้อทั้งหมดของสมาชิกที่ล็อกอินอยู่
  app.get('/mem/orders/:IDMem', (req, res) => {
    const { IDMem } = req.params;
    console.log("Fetching orders for IDMem:", IDMem); // ดูค่า IDMem ว่าถูกต้องหรือไม่
  
    const query = 'SELECT * FROM order_list WHERE IDMem = ?';
    db.query(query, [IDMem], (err, result) => {
      if (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
        return;
      }
      console.log("Fetched orders:", result); // ดูผลลัพธ์จากการ query
      res.json(result); // ส่งข้อมูลคำสั่งซื้อกลับไปยังฝั่งไคลเอนต์
    });
  });
  */
  app.get('/mem/orders/:IDMem', (req, res) => { 
    const { IDMem } = req.params;
    console.log("Fetching orders for IDMem:", IDMem);

    const query = `
    SELECT 
        order_list.IDOrder, 
        order_list.stOrder, 
        order_detail.Price, 
        order_detail.Unit, 
        order_detail.UnitCount, 
        order_detail.TotalPrice, 
        product.NamePro, 
        product.ImagePro, 
        product.DetailPro
    FROM 
        order_list
    JOIN 
        order_detail ON order_list.IDOrder = order_detail.IDOrder
    JOIN 
        product ON order_detail.IDProduct = product.IDProduct
    WHERE 
        order_list.IDMem = ?`;

    db.query(query, [IDMem], (err, result) => {
      if (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
        return;
      }
      
      // จัดรูปแบบผลลัพธ์
      const orders = result.reduce((acc, order) => {
        // ค้นหาคำสั่งซื้อในอาเรย์ที่รวบรวมไว้แล้ว
        let existingOrder = acc.find(o => o.IDOrder === order.IDOrder);
        
        // ถ้ายังไม่มีคำสั่งซื้อนี้ในผลลัพธ์
        if (!existingOrder) {
          existingOrder = {
            IDOrder: order.IDOrder,
            stOrder: order.stOrder,
            products: []
          };
          acc.push(existingOrder);
        }
        
        // เพิ่มรายละเอียดของผลิตภัณฑ์ลงในคำสั่งซื้อ
        existingOrder.products.push({
          NamePro: order.NamePro,
          ImagePro: order.ImagePro,
          DetailPro: order.DetailPro,
          Price: order.Price,
          Unit: order.Unit,
          UnitCount: order.UnitCount,
          TotalPrice: order.TotalPrice
        });

        return acc;
      }, []);
      
      console.log("Fetched orders:", orders); // ดูผลลัพธ์ที่จัดรูปแบบ
      res.json(orders); // ส่งข้อมูลคำสั่งซื้อที่จัดรูปแบบกลับไปยังฝั่งไคลเอนต์
    });
});


app.get('/users', (req, res) => {
    const sql = 'SELECT * FROM view_user';  // Adjust table/view name if necessary

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: err });
        }
        res.json(result);
    });
});

app.get('/order_list', (req, res) => {
    db.query("SELECT * FROM order_list", (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query error');
        } else {
            res.json(result);
        }
    });
});

// ดึงข้อมูล banks
app.get('/getBanks', (req, res) => {
    const query = 'SELECT * FROM bank';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching bank data:', err);
            return res.status(500).json({ error: 'Error fetching bank data' });
        }
        res.json(results);
    });
});

// ดึงข้อมูล promptpay
app.get('/getpromptpay', (req, res) => {
    const query = 'SELECT IDPromPtpay, AccoutName, PromPtpayNumber, ImagePromPtpay FROM promptpay';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching promptpay data:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});


/********************************************จัดการคำสั่งซื้อของAdmin**************************************** */
// ดึงข้อมูลทั้งหมดของ Orders
app.get('/getOrders', (req, res) => {
    const query = 'SELECT * FROM order_list';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// สร้าง API สำหรับดึงข้อมูลคำสั่งซื้อและรายละเอียดตาม IDOrder
/*
app.get('/api/orders/:IDOrder', (req, res) => {
    const IDOrder = req.params.IDOrder;

    const query = `
    SELECT 
        ol.IDOrder,
        ol.Date,
        ol.TotalPrice AS OrderTotalPrice,
        ol.Profit AS OrderProfit,
        ol.Quantity AS OrderQuantity,
        ol.stOrder AS OrderStatus,
        od.IDProduct,
        od.Unit,
        od.UnitCount,
        od.Price AS ProductPrice,
        od.TotalPrice AS ProductTotalPrice,
        od.Profit AS ProductProfit,
        od.ReturnProduct
    FROM 
        order_list ol
    JOIN 
        order_detail od
    ON 
        ol.IDOrder = od.IDOrder
    WHERE 
        ol.IDOrder = ?`;

    // ใช้ '?' เพื่อป้องกัน SQL injection และใช้ 'IDOrder' เป็นพารามิเตอร์
    db.query(query, [IDOrder], (err, result) => {
        if (err) {
            console.error('Error executing query', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(result);
    });
});
*/

// สร้าง API สำหรับดึงข้อมูลสินค้าโดย ID
app.get('/api/products/:id', (req, res) => {
    const IDProduct = req.params.id;

    const query = 'SELECT * FROM product WHERE IDProduct = ?';
    
    db.query(query, [IDProduct], (err, result) => {
        if (err) {
            console.error('Error fetching product', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        // เช็คว่าได้ข้อมูลสินค้าหรือไม่
        if (result.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // ส่งข้อมูลสินค้าในรูปแบบที่ต้องการ
        const product = result[0];
        res.json({
            IDProduct: product.IDProduct,
            Name: product.NamePro,
            Detail: product.DetailPro,
            Unit: product.UnitPro,
            UnitCount: product.UnitCount,
            SalePrice: product.SalePrice,
            CostPrice: product.CostPrice,
            ReorderPoint: product.ReorderPoint,
            Date: product.Date,
            ShelfLife: product.ShelfLife,
            IDType: product.IDType,
            Image: product.ImagePro,
            Status: product.stPro
        });
    });
});

// API Endpoint สำหรับดึงข้อมูลการชำระเงินตาม IDOrder
app.get('/api/payments/:id', (req, res) => {
    const IDOrder = req.params.id; // ดึง IDOrder จากพารามิเตอร์ URL

    // ตรวจสอบสถานะคำสั่งซื้อ
    const queryOrderStatus = 'SELECT stOrder FROM order_list WHERE IDOrder = ?';
    db.query(queryOrderStatus, [IDOrder], (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'ไม่สามารถดึงสถานะคำสั่งซื้อได้' });
        }

        // ถ้าหากไม่พบคำสั่งซื้อ
        if (order.length === 0) {
            return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อนี้' });
        }

        // ตรวจสอบสถานะคำสั่งซื้อ
        if (order[0].stOrder !== 'W') {
            return res.status(403).json({ error: 'ไม่สามารถเข้าถึงข้อมูลการชำระเงินในสถานะนี้ได้' });
        }

        // ดึงข้อมูลการชำระเงินถ้าสถานะคำสั่งซื้อเป็น 'W'
        const queryPayment = 'SELECT * FROM payment WHERE IDOrder = ?';
        db.query(queryPayment, [IDOrder], (err, payment) => {
            if (err) {
                return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลการชำระเงินได้' });
            }

            // ตรวจสอบว่ามีข้อมูลการชำระเงินหรือไม่
            if (payment.length === 0) {
                return res.status(404).json({ error: 'ไม่พบข้อมูลการชำระเงินสำหรับคำสั่งซื้อนี้' });
            }

            res.json(payment[0]); // ส่งข้อมูลการชำระเงิน
        });
    });
});



  

// สร้าง API สำหรับดึงข้อมูลคำสั่งซื้อและรายละเอียดตาม IDOrder
app.get('/api/orders/:IDOrder', (req, res) => {
    const IDOrder = req.params.IDOrder;

    // ตรวจสอบว่า IDOrder เป็นตัวเลขหรือไม่
    if (isNaN(IDOrder)) {
        return res.status(400).json({ error: 'Invalid Order ID' });
    }

    const query = `
    SELECT 
        ol.IDOrder,
        ol.Date,
        ol.TotalPrice AS OrderTotalPrice,
        ol.Profit AS OrderProfit,
        ol.Quantity AS OrderQuantity,
        ol.stOrder AS OrderStatus,
        od.IDProduct,
        p.NamePro AS ProductName,
        od.Unit,
        od.UnitCount,
        od.Price AS ProductPrice,
        od.TotalPrice AS ProductTotalPrice,
        od.Profit AS ProductProfit,
        od.ReturnProduct
    FROM 
        order_list ol
    JOIN 
        order_detail od ON ol.IDOrder = od.IDOrder
    JOIN 
        product p ON od.IDProduct = p.IDProduct
    WHERE 
        ol.IDOrder = ?`;

    db.query(query, [IDOrder], (err, result) => {
        if (err) {
            console.error('Error executing query:', query, 'with parameters:', [IDOrder], err);
            return res.status(500).json({ error: 'Database query error' });
        }

        // เช็คว่าได้ข้อมูลคำสั่งซื้อหรือไม่
        if (result.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // ส่งข้อมูลคำสั่งซื้อในรูปแบบที่ต้องการ
        res.json(result.map(item => ({
            IDOrder: item.IDOrder,
            Date: item.Date,
            OrderTotalPrice: item.OrderTotalPrice,
            OrderProfit: item.OrderProfit,
            OrderQuantity: item.OrderQuantity,
            OrderStatus: item.OrderStatus,
            IDProduct: item.IDProduct,
            ProductName: item.ProductName,
            Unit: item.Unit,
            UnitCount: item.UnitCount,
            ProductPrice: item.ProductPrice,
            ProductTotalPrice: item.ProductTotalPrice,
            ProductProfit: item.ProductProfit,
            ReturnProduct: item.ReturnProduct
        })));
    });
});

/*
// อัปเดตสถานะคำสั่งซื้อ
app.post('/api/updateOrderStatus/:IDOrder', async (req, res) => {
    const { newStatus } = req.body; // รับสถานะใหม่จาก body

    try {
        const validStatuses = ['N', 'P', 'C', 'S', 'D', 'X', 'R'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
        }

        const IDOrder = req.params.IDOrder; // รับ IDOrder จาก params
        // อัปเดตสถานะใน order_list เท่านั้น
        await db.query('UPDATE order_list SET stOrder = ? WHERE IDOrder = ?', [newStatus, IDOrder]);

        return res.status(200).json({ message: "อัปเดตสถานะสำเร็จ" });
    } catch (error) {
        console.error("Error updating status:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" });
    }
});

// API สำหรับดึงข้อมูลสถานะคำสั่งซื้อจาก order_list
app.get('/order/status/:IDOrder', (req, res) => {
    const { IDOrder } = req.params;

    const queryOrderList = `SELECT IDOrder, stOrder FROM order_list WHERE IDOrder = ?`;
    const queryOrderDetail = `SELECT IDOrder, stOrder FROM order_detail WHERE IDOrder = ?`;

    db.query(queryOrderList, [IDOrder], (err, orderListResult) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving order list status', error: err });
        }

        // เนื่องจากไม่ต้องการข้อมูลจาก order_detail ในการตอบสนองนี้ เราจะส่งเฉพาะข้อมูลจาก order_list
        res.json({
            orderList: orderListResult
        });
    });
});*/

// อัปเดตข้อมูลใน order_list
app.put('/order/:IDOrder', (req, res) => {
    const sql = "UPDATE order_list SET `stOrder` = ?, `TrackingID` = ? WHERE IDOrder = ?";
    const { IDOrder } = req.params;
    const { stOrder, TrackingID } = req.body; // เพิ่ม TrackingID

    db.query(sql, [stOrder, TrackingID, IDOrder], (err, result) => {
        if (err) {
            console.error('Error in SQL query:', err);
            return res.status(500).json({ Message: "Error inside server" });
        }
        res.json({ message: "Status updated successfully", result });
    });
});

// แสดงข้อมูลในตาราง order_list สำหรับ IDOrder ที่ระบุ
app.get('/order/:IDOrder', (req, res) => {
    const { IDOrder } = req.params;
    db.query("SELECT IDOrder, stOrder FROM order_list WHERE IDOrder = ?", [IDOrder], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query error');
        } else {
            console.log('API Response:', result); // Log result
            if (result.length === 0) {
                console.log('No records found for IDOrder:', IDOrder);
                res.status(404).json({ Message: 'No records found' });
            } else {
                res.json(result[0]); // ส่งข้อมูลเฉพาะเรคคอร์ดแรก
            }
        }
    });
});










app.listen(8082, () => {
    console.log('Server is listening on port 8082');
});
