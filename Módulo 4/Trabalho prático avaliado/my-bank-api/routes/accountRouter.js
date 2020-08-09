import express from 'express';
import { accountModel } from '../models/accounts.js';
const router = express();

//Retorna todas as contas
router.get('/accounts', async (_, res) => {
  try {
    const account = await accountModel.find({});
    res.send(JSON.stringify(account));
  } catch (error) {
    res.status(500).send(error);
  }
});

//Cadastro de um novo cliente
router.post('/accounts', async (req, res) => {
  try {
    // Schema realiza verficações/validações necessárias
    const account = new accountModel(req.body);
    await account.save();

    res.send(account);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Fazer um deposito em conta
router.patch('/accounts/deposit', async (req, res) => {
  let params = req.body;
  try {
    const account = await accountModel.findOneAndUpdate(
      { agencia: params.agencia, conta: params.conta },
      { $inc: { balance: params.value } },
      { new: true }
    );
    if (!account) {
      res.status(404).send('Conta inexistente');
    }
    const newBalance = account.balance;
    res.send(`Novo saldo: ${newBalance}`);
  } catch (error) {
    res.status(500).send(error);
  }
});
//Fazer um saque em conta, debitar 1 de tarifa e verificar se há saldo
router.patch('/accounts/saque', async (req, res) => {
  try {
    let params = req.body;
    const taxaSaque = -(params.value + 1);
    const account = await accountModel.findOneAndUpdate(
      { agencia: params.agencia, conta: params.conta },
      { $inc: { balance: taxaSaque } },
      { new: true }
    );
    if (!account) {
      res.status(404).send('Conta inexistente');
    }
    if (account.balance + params.value < 0) {
      res.status(404).send('Saldo insuficiente!');
      const account = await accountModel.findOneAndUpdate(
        { agencia: params.agencia, conta: params.conta },
        { $inc: { balance: -taxaSaque } },
        { new: true }
      );
    }
    const newBalance = account.balance;
    res.send(`Novo saldo: ${newBalance}`);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Retorna o saldo da conta de acordo agencia e conta
router.get('/accounts/:agencia/:conta', async (req, res) => {
  try {
    let params = req.params;
    const account = await accountModel.findOne({
      agencia: params.agencia,
      conta: params.conta,
    });
    if (!account) {
      res.send(404).send('Conta inexistente!');
    }
    const saldo = account.balance;
    res.send(`Saldo: ${saldo}`);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Deletar uma conta a partir de agencia e conta e retornar o numero de clientes daquela agencia
router.delete('/accounts/:agencia/:conta', async (req, res) => {
  try {
    let params = req.params;

    const accountToDelete = await accountModel.findOneAndDelete({
      agencia: params.agencia,
      conta: params.conta,
    });

    const account = await accountModel.find({ agencia: params.agencia });
    const total = account.length;
    console.log(total);

    if (!account) {
      res.statusMessage(404).send('Conta inexistente.');
    }

    //const accountsForAgency = Object.values(account).length;
    res.send(
      `Número de contas ativas da agência ${params.agencia}: ${total} contas`
    );
  } catch (error) {
    res.status(500).send(error);
  }
});

//Fazer transferencia entre duas contas
router.patch('/accounts/transferencia', async (req, res) => {
  let params = req.body;
  try {
    const accountOrigin = await accountModel.findOne(
      { conta: params.origin },
      { _id: 0, agencia: 1 }
    );
    const accountDestiny = await accountModel.findOne(
      { conta: params.destiny },
      { _id: 0, agencia: 1 }
    );
    if (!accountOrigin) {
      res.status(404).send('Conta origem inexistente!');
    } else if (!accountDestiny) {
      res.status(404).send('Conta destino inexistente!');
    } else {
      if (accountOrigin.agencia === accountDestiny.agencia) {
        const newAccountOrigin = await accountModel.findOneAndUpdate(
          { conta: params.origin },
          { $inc: { balance: -params.value } }
        );
        const newAccountDestiny = await accountModel.findOneAndUpdate(
          { conta: params.destiny },
          { $inc: { balance: params.value } }
        );
        res.send(
          `Novo saldo conta origem: ${
            newAccountOrigin.balance - params.value
          }<br>Novo saldo da conta destino: ${
            newAccountDestiny.balance + params.value
          }`
        );
      } else if (accountOrigin.agencia !== accountDestiny.agencia) {
        let taxaTransfer = params.value + 8;
        const newAccountOrigin = await accountModel.findOneAndUpdate(
          { conta: params.origin },
          { $inc: { balance: -taxaTransfer } }
        );
        const newAccountDestiny = await accountModel.findOneAndUpdate(
          { conta: params.destiny },
          { $inc: { balance: params.value } }
        );
        res.send(
          `Novo saldo conta origem: ${
            newAccountOrigin.balance - taxaTransfer
          }<br>Novo saldo da conta destino: ${
            newAccountDestiny.balance + params.value
          }`
        );
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//Retorna a media de saldo dos clientes de acordo a agencia
router.get('/accounts/agencia', async (req, res) => {
  try {
    let params = req.body;

    const account = await accountModel.aggregate([
      { $match: { agencia: params.agencia } },
      { $group: { _id: null, total: { $avg: '$balance' } } },
    ]);

    res.send(account);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Retorna os clientes de forma crescente com menor saldo em conta de acordo a quantidade passada
router.get('/accounts/less', async (req, res) => {
  try {
    let params = req.body;

    let array = [];

    const account = await accountModel.find().sort({ balance: 1 });

    account.forEach((el) => {
      array.push(
        ` Agência: ${el.agencia}, Conta: ${el.conta}, Saldo:${el.balance} `
      );
      return array;
    });

    const arrayAccounts = JSON.stringify(array.slice(0, params.value));

    res.send(arrayAccounts);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Retorna os clientes de forma decrescente com os maiores saldos de acordo a quantidade passada
router.get('/accounts/more', async (req, res) => {
  try {
    let params = req.body;

    let array = [];

    const account = await accountModel.find().sort({ balance: -1, name: 1 });

    account.forEach((el) => {
      array.push(
        ` Agência: ${el.agencia}, Conta: ${el.conta}, Nome: ${el.name}, Saldo:${el.balance} `
      );
      return array;
    });

    const arrayAccounts = JSON.stringify(array.slice(0, params.value));

    res.send(arrayAccounts);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Transfere o cliente com maior saldo em conta de cada agência para a agência private agencia=99
router.patch('/accounts/transfer', async (req, res) => {
  try {
    const account = await accountModel.find();

    let bigValue = new Map();

    for (let i = 0; i < account.length; i++) {
      if (!bigValue.get(account[i].agencia)) {
        bigValue.set(account[i].agencia, account[i]);
      } else {
        if (bigValue.get(account[i].agencia).balance < account[i].balance) {
          bigValue.set(account[i].agencia, account[i]);
        }
      }
    }

    for (const acc of bigValue) {
      await accountModel.findOneAndUpdate(
        { conta: acc[1].conta, agencia: acc[1].agencia },
        { agencia: 99 },
        { new: true }
      );
    }

    const accounts99 = await accountModel.find({ agencia: 99 });
    const clientesPrivate = JSON.stringify(accounts99);

    console.log(accounts99);
    res.send(clientesPrivate);
  } catch (err) {
    res.status(500).send(err);
  }
});
export { router };
