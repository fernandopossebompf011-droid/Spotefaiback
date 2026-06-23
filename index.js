const express = require('express')
const cors = require('cors')
const { pool } = require('./config');


const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

const getMusicas = async (request, response) => {
    try {
        const { rows } = await pool.query(`
            SELECT codigo, titulo, artista, album, duracao, youtube
            FROM musicas
            ORDER BY codigo
        `);

        return response.status(200).json(rows);

    } catch (err) {
        return response.status(500).json({
            status: 'error',
            message: 'Erro ao consultar as músicas: ' + err.message
        });
    }
};

const addMusica = async (request, response) => {
    try {
        const { titulo, artista, album, duracao, youtube } = request.body;

        const { rows } = await pool.query(`
            INSERT INTO musicas (titulo, artista, album, duracao, youtube)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING codigo, titulo, artista, album, duracao, youtube
        `, [titulo, artista, album, duracao, youtube]);

        return response.status(201).json({
            status: 'success',
            message: 'Música criada com sucesso',
            objeto: rows[0]
        });

    } catch (err) {
        return response.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

const updateMusica = async (request, response) => {
    try {
        const { codigo, titulo, artista, album, duracao, youtube } = request.body;

        const { rows, rowCount } = await pool.query(`
            UPDATE musicas
            SET titulo = $2,
                artista = $3,
                album = $4,
                duracao = $5,
                youtube = $6
            WHERE codigo = $1
            RETURNING codigo, titulo, artista, album, duracao, youtube
        `, [codigo, titulo, artista, album, duracao, youtube]);

        if (rowCount === 0) {
            return response.status(404).json({
                status: 'error',
                message: 'Música não encontrada'
            });
        }

        return response.status(200).json({
            status: 'success',
            message: 'Música atualizada com sucesso',
            objeto: rows[0]
        });

    } catch (err) {
        return response.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

const deleteMusica = async (request, response) => {
    const codigo = request.params.codigo;

    try {
        const results = await pool.query(
            'DELETE FROM musicas WHERE codigo = $1',
            [codigo]
        );

        if (results.rowCount === 0) {
            return response.status(404).json({
                status: 'error',
                message: `Nenhuma música encontrada com o código ${codigo}`
            });
        }

        return response.status(200).json({
            status: 'success',
            message: 'Música removida com sucesso'
        });

    } catch (err) {
        return response.status(500).json({
            status: 'error',
            message: 'Erro ao remover a música: ' + err.message
        });
    }
};

const getMusicaPorCodigo = async (request, response) => {
    const codigo = request.params.codigo;

    try {
        const results = await pool.query(`
            SELECT codigo, titulo, artista, album, duracao, youtube
            FROM musicas
            WHERE codigo = $1
        `, [codigo]);

        if (results.rowCount === 0) {
            return response.status(404).json({
                status: 'error',
                message: `Nenhuma música encontrada com o código ${codigo}`
            });
        }

        return response.status(200).json(results.rows[0]);

    } catch (err) {
        return response.status(500).json({
            status: 'error',
            message: 'Erro ao consultar a música: ' + err.message
        });
    }
};

app.get('/musicas', getMusicas);
app.get('/musicas/:codigo', getMusicaPorCodigo);
app.post('/musicas', addMusica);
app.put('/musicas', updateMusica);
app.delete('/musicas/:codigo', deleteMusica);


app.listen(process.env.PORT || 3002, () => {
    console.log('Servidor da API rodando....')
})