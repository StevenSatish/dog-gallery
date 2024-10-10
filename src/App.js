import './App.css';
import Select from 'react-select';
import {useState, useEffect} from 'react';

function App() {
    const [allBreeds, setAllBreeds] = useState([]);
    const [selectedBreeds, setSelectedBreeds] = useState([]);
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await fetch('https://dog.ceo/api/breeds/list/all'); // Replace with your actual API URL
                const data = await response.json();
                if (!data || data.status !== 'success') {
                    throw new Error('server side failure: breeds fetch');
                }
                const breeds = data.message;
                const formattedOptions = [];
                // go over breeds
                for (const breed in breeds) {
                    if (breeds[breed].length > 0) {
                        // If the breed has sub-breeds, add them each as their own breed
                        breeds[breed].forEach(subBreed => {
                            formattedOptions.push({
                                value: `${breed}$/${subBreed}`,
                                label: `${subBreed} ${breed}`
                            });
                        });
                    } else {
                        // If no sub-breeds, just add the breed itself
                        formattedOptions.push({
                            value: breed,
                            label: breed
                        });
                    }
                }
                setAllBreeds(formattedOptions);
            } catch (error) {
                console.error('Error fetching dog breeds:', error);
            }
        };
        fetchOptions();
    }, []);
    useEffect(() => {
        const fetchAllBreedImages = async () => {
            try {
                const response = await fetch('https://dog.ceo/api/breeds/image/random/50'); // Replace with your actual API URL
                const data = await response.json();
                if (!data || data.status !== 'success') {
                    throw new Error('server side failure: images fetch');
                }
                setImages(data.message);
            } catch (error) {
                console.error('Error fetching dog images:', error);
            }
        };

        const fetchSelectedBreedImages = async (breed) => {
            try {
                const response = await fetch(`https://dog.ceo/api/breed/${breed.value}/images`);
                const data = await response.json();
                if (!data || data.status !== 'success') {
                    throw new Error('server side failure: images fetch');
                }
                return data.message;
            } catch (error) {
                console.error('Error fetching dog images:', error);
                return []; // Return an empty array on error to avoid breaking the loop
            }
        };

        if (selectedBreeds.length === 0) {
            fetchAllBreedImages();
        } else {
            const fetchImages = async () => {
                try {
                    const promises = selectedBreeds.map(breed => fetchSelectedBreedImages(breed));
                    const breedImagesArray = await Promise.all(promises);
                    const newImages = breedImagesArray.flat();
                    const shuffledImages = shuffleImages(newImages);
                    setImages(shuffledImages);
                } catch (error) {
                    console.error('Error fetching selected breed images:', error);
                }
            };

            fetchImages();
        }
    }, [selectedBreeds]);
    const shuffleImages = (images) => {
        for (let i = images.length - 1; i > 0; i--) {
            // Generate a random index from 0 to i
            const j = Math.floor(Math.random() * (i + 1));
            // Swap elements at index i and j
            [images[i], images[j]] = [images[j], images[i]];
        }
        return images;
    };
    const handleChange = (selected) => {
        setSelectedBreeds(selected);
    };

    return (
        <div>
            <header className={'header'}> Dog API Image Gallery!</header>
            <Select
                className={"search"}
                isMulti
                options={allBreeds}
                onChange={handleChange}
                placeholder="Select a dog breed..."
            />
            <div>
                {images.map((url, index) => (
                    <img key={index} src={url} alt={`Dog ${index + 1}`}
                         className={"dog-image"}/>
                ))}
            </div>
        </div>
    );
}

export default App;
