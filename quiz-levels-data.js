/**
 * Quiz Levels Data - 20 Levels for Each Category
 * Arithmetic, Algebra, and Geometry
 */

const QuizLevelsData = {
    /**
     * ARITHMETIC - 20 Levels
     * Progressive difficulty from basic to advanced
     */
    arithmetic: [
        // Levels 1-5: Basic Operations
        { level: 1, type: 'addition', range: [1, 10], operations: ['+'] },
        { level: 2, type: 'subtraction', range: [1, 20], operations: ['-'] },
        { level: 3, type: 'mixed', range: [1, 20], operations: ['+', '-'] },
        { level: 4, type: 'multiplication', range: [1, 10], operations: ['×'] },
        { level: 5, type: 'division', range: [2, 10], operations: ['÷'] },
        
        // Levels 6-10: Intermediate
        { level: 6, type: 'mixed', range: [1, 30], operations: ['+', '-', '×'] },
        { level: 7, type: 'mixed', range: [1, 50], operations: ['+', '-', '×', '÷'] },
        { level: 8, type: 'two_step', range: [1, 20], operations: ['+', '-'] },
        { level: 9, type: 'two_step', range: [1, 20], operations: ['×', '+'] },
        { level: 10, type: 'squares', range: [1, 12], operations: ['square'] },
        
        // Levels 11-15: Advanced
        { level: 11, type: 'three_step', range: [1, 20], operations: ['+', '-', '×'] },
        { level: 12, type: 'fractions', range: [1, 10], operations: ['+'] },
        { level: 13, type: 'fractions', range: [1, 10], operations: ['-'] },
        { level: 14, type: 'decimals', range: [1, 10], operations: ['+'] },
        { level: 15, type: 'percentages', range: [10, 100], operations: ['%'] },
        
        // Levels 16-20: Expert
        { level: 16, type: 'mixed_advanced', range: [10, 100], operations: ['+', '-', '×', '÷'] },
        { level: 17, type: 'powers', range: [2, 5], operations: ['^'] },
        { level: 18, type: 'roots', range: [1, 100], operations: ['√'] },
        { level: 19, type: 'complex', range: [1, 50], operations: ['all'] },
        { level: 20, type: 'master', range: [1, 100], operations: ['all'] }
    ],
    
    /**
     * ALGEBRA - 20 Levels
     * From simple equations to complex polynomials
     */
    algebra: [
        // Levels 1-5: Basic Linear Equations
        { level: 1, type: 'linear_simple', form: 'x + a = b', range: [1, 20] },
        { level: 2, type: 'linear_simple', form: 'x - a = b', range: [1, 20] },
        { level: 3, type: 'linear_simple', form: 'ax = b', range: [1, 20] },
        { level: 4, type: 'linear_simple', form: 'x/a = b', range: [1, 20] },
        { level: 5, type: 'linear_two_step', form: 'ax + b = c', range: [1, 20] },
        
        // Levels 6-10: Intermediate Linear
        { level: 6, type: 'linear_two_step', form: 'ax - b = c', range: [1, 30] },
        { level: 7, type: 'linear_multi_step', form: 'ax + b = cx + d', range: [1, 20] },
        { level: 8, type: 'linear_brackets', form: 'a(x + b) = c', range: [1, 20] },
        { level: 9, type: 'linear_fractions', form: 'x/a + b = c', range: [1, 20] },
        { level: 10, type: 'quadratic_simple', form: 'x² = a', range: [1, 100] },
        
        // Levels 11-15: Quadratic Equations
        { level: 11, type: 'quadratic_sum', form: 'sum of roots', range: [1, 10] },
        { level: 12, type: 'quadratic_product', form: 'product of roots', range: [1, 10] },
        { level: 13, type: 'quadratic_factoring', form: '(x-a)(x-b) = 0', range: [1, 10] },
        { level: 14, type: 'quadratic_complete', form: 'x² + bx + c = 0', range: [1, 10] },
        { level: 15, type: 'quadratic_discriminant', form: 'b² - 4ac', range: [1, 10] },
        
        // Levels 16-20: Advanced
        { level: 16, type: 'cubic_sum', form: 'sum of cubic roots', range: [1, 8] },
        { level: 17, type: 'simultaneous', form: 'two equations', range: [1, 10] },
        { level: 18, type: 'inequalities', form: 'ax + b > c', range: [1, 20] },
        { level: 19, type: 'exponential', form: 'a^x = b', range: [2, 5] },
        { level: 20, type: 'logarithmic', form: 'log_a(x) = b', range: [2, 10] }
    ],
    
    /**
     * GEOMETRY - 20 Levels
     * From basic shapes to complex theorems
     */
    geometry: [
        // Levels 1-5: Basic Shapes
        { level: 1, type: 'square_area', shape: 'square', property: 'area' },
        { level: 2, type: 'square_perimeter', shape: 'square', property: 'perimeter' },
        { level: 3, type: 'rectangle_area', shape: 'rectangle', property: 'area' },
        { level: 4, type: 'rectangle_perimeter', shape: 'rectangle', property: 'perimeter' },
        { level: 5, type: 'triangle_area', shape: 'triangle', property: 'area' },
        
        // Levels 6-10: Intermediate Shapes
        { level: 6, type: 'triangle_angles', shape: 'triangle', property: 'angles' },
        { level: 7, type: 'circle_area', shape: 'circle', property: 'area' },
        { level: 8, type: 'circle_circumference', shape: 'circle', property: 'circumference' },
        { level: 9, type: 'parallelogram', shape: 'parallelogram', property: 'area' },
        { level: 10, type: 'trapezoid', shape: 'trapezoid', property: 'area' },
        
        // Levels 11-15: Advanced 2D
        { level: 11, type: 'parallel_angles', concept: 'parallel lines', property: 'angles' },
        { level: 12, type: 'complementary', concept: 'angle pairs', property: 'complementary' },
        { level: 13, type: 'supplementary', concept: 'angle pairs', property: 'supplementary' },
        { level: 14, type: 'exterior_angle', concept: 'triangle', property: 'exterior angle' },
        { level: 15, type: 'pythagorean', concept: 'right triangle', property: 'Pythagorean theorem' },
        
        // Levels 16-20: 3D Geometry
        { level: 16, type: 'cube_volume', shape: '3D cube', property: 'volume' },
        { level: 17, type: 'cube_surface', shape: '3D cube', property: 'surface area' },
        { level: 18, type: 'cylinder_volume', shape: '3D cylinder', property: 'volume' },
        { level: 19, type: 'sphere_volume', shape: '3D sphere', property: 'volume' },
        { level: 20, type: 'cone_volume', shape: '3D cone', property: 'volume' }
    ]
};

// Export for use in mini-games
if (typeof window !== 'undefined') {
    window.QuizLevelsData = QuizLevelsData;
}
