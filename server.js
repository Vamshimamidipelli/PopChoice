import express from 'express';
import { hf, supabase } from './config.js';
import { movies } from './content.js';

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/search', async (req, res) => {
    const { query } = req.body;

    try {
        // Step 1: Convert user input -> embedding
        const embedding = await hf.featureExtraction({
            model: "sentence-transformers/all-MiniLM-L6-v2",
            inputs: query,
        });

        // The shape of embedding depends on the HF API response.
        // Usually, for a single string, it returns an array of numbers.
        const query_embedding = Array.isArray(embedding[0]) ? embedding[0] : embedding;

        // Step 2: Call Supabase function
        const { data, error } = await supabase.rpc('match_movies', {
            query_embedding: query_embedding,
            match_threshold: 0.1, // Lowered threshold to get matches even if similarity is < 0.2
            match_count: 3
        });

        if (error) {
            console.error("Supabase Error:", error);
            return res.status(500).json({ error: error.message || error });
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
